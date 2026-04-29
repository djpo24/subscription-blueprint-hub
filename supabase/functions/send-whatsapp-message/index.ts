import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════════════════════
//  send-whatsapp-message
//
//  POST {
//    customer_id?: string | null,
//    phone_number: string,        // E.164 o local
//    country_code?: string,       // dígitos, default "57"
//    text: string,                // mensaje (free-text dentro de ventana 24h)
//    conversation_id?: string,
//  } → { success, message_id, message_row_id, conversation_id }
//
//  Flujo:
//    1. Authorize (JWT operador o service_role)
//    2. Normalizar teléfono
//    3. POST /messages a Meta (free-text)
//    4. Upsert whatsapp_conversations + INSERT whatsapp_messages
//
//  verify_jwt = true (en config.toml).
// ═══════════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WA_API_BASE = "https://graph.facebook.com/v19.0";

async function sendFreeText(
  pid: string,
  token: string,
  fullPhone: string,
  text: string,
): Promise<{ messageId: string | null; error?: string; errorCode?: number; errorTitle?: string }> {
  const body = {
    messaging_product: "whatsapp",
    to: fullPhone,
    type: "text",
    text: { body: text, preview_url: false },
  };

  const res = await fetch(`${WA_API_BASE}/${pid}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const metaError = data?.error ?? {};
    return {
      messageId: null,
      error: metaError.message ?? "WhatsApp API error",
      errorCode: typeof metaError.code === "number" ? metaError.code : undefined,
      errorTitle: metaError.error_data?.details ?? metaError.type ?? null,
    };
  }
  return { messageId: data?.messages?.[0]?.id ?? null };
}

async function authorize(
  req: Request,
  serviceRoleKey: string,
): Promise<{ ok: boolean; userId: string | null }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return { ok: false, userId: null };

  const bearerToken = authHeader.replace("Bearer ", "").trim();
  if (bearerToken === serviceRoleKey) {
    return { ok: true, userId: null };
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) return { ok: false, userId: null };
  return { ok: true, userId: user.id };
}

async function getMetaCredentials(
  supabase: ReturnType<typeof createClient>,
): Promise<{ token: string; phoneNumberId: string }> {
  const tokenEnv = Deno.env.get("WHATSAPP_TOKEN") ?? Deno.env.get("META_WHATSAPP_TOKEN") ?? "";
  const pidEnv   = Deno.env.get("PHONE_NUMBER_ID") ?? Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID") ?? "";

  if (tokenEnv && pidEnv) return { token: tokenEnv, phoneNumberId: pidEnv };

  const { data: tokenData } = await supabase.rpc("get_app_secret", { secret_name: "META_WHATSAPP_TOKEN" });
  const { data: pidData }   = await supabase.rpc("get_app_secret", { secret_name: "META_WHATSAPP_PHONE_NUMBER_ID" });
  return {
    token: (tokenData as string) ?? tokenEnv,
    phoneNumberId: (pidData as string) ?? pidEnv,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const auth = await authorize(req, SERVICE_KEY);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { token, phoneNumberId } = await getMetaCredentials(supabase);
    if (!token || !phoneNumberId) {
      throw new Error("WHATSAPP_TOKEN or PHONE_NUMBER_ID not configured");
    }

    const {
      customer_id,
      phone_number,
      country_code,
      text,
      conversation_id,
    } = await req.json();

    if (!phone_number || !text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone_number, text" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const cc = (country_code ?? "57").replace(/\D/g, "");
    let phone = String(phone_number).replace(/\D/g, "");
    if (phone.startsWith(cc) && phone.length > 10) phone = phone.slice(cc.length);
    const fullPhone = cc + phone;

    const result = await sendFreeText(phoneNumberId, token, fullPhone, text.trim());

    const { data: conv } = await supabase
      .from("whatsapp_conversations")
      .upsert(
        {
          phone_number: fullPhone,
          customer_id: customer_id ?? null,
          status: "open",
          last_message_at: new Date().toISOString(),
        },
        { onConflict: "phone_number" },
      )
      .select("id")
      .single();
    const convId = conversation_id ?? (conv as { id?: string } | null)?.id ?? null;

    const status = result.messageId ? "sent" : "failed";

    const { data: inserted, error: insertErr } = await supabase
      .from("whatsapp_messages")
      .insert({
        conversation_id: convId,
        customer_id: customer_id ?? null,
        direction: "outbound",
        message_type: "text",
        content: text.trim(),
        waba_message_id: result.messageId,
        status,
        error_message: result.error ?? null,
        error_code: result.errorCode ?? null,
        error_title: result.errorTitle ?? null,
        failed_at: result.messageId ? null : new Date().toISOString(),
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[send-whatsapp-message] insert error:", insertErr);
    }

    if (result.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          message_row_id: inserted?.id ?? null,
          conversation_id: convId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.messageId,
        message_row_id: inserted?.id ?? null,
        conversation_id: convId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );

  } catch (error: unknown) {
    console.error("[send-whatsapp-message] error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
