import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  uploadBufferToMeta,
  WHATSAPP_MEDIA_BUCKET,
} from "../_shared/whatsapp-media.ts";

// ═══════════════════════════════════════════════════════════════════════════════
//  whatsapp-upload-and-send-media
//
//  POST {
//    conversation_id?: string,
//    customer_id?: string | null,
//    phone_number: string,
//    country_code?: string,       // "57" default
//    media_path: string,          // path en bucket whatsapp-media (sub. previa)
//    media_type: 'image'|'audio'|'video'|'document',
//    media_mime_type: string,
//    media_size_bytes?: number,
//    caption?: string,
//  } → { success, message_id, message_row_id, conversation_id }
// ═══════════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WA_API_BASE = "https://graph.facebook.com/v19.0";

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

async function sendMediaMessage(
  pid: string,
  token: string,
  fullPhone: string,
  mediaType: "image" | "audio" | "video" | "document",
  metaMediaId: string,
  caption: string | null,
): Promise<{ messageId: string | null; error?: string; errorCode?: number; errorTitle?: string }> {
  const mediaPayload: Record<string, unknown> = { id: metaMediaId };
  if (caption && (mediaType === "image" || mediaType === "video" || mediaType === "document")) {
    mediaPayload.caption = caption;
  }

  const body = {
    messaging_product: "whatsapp",
    to: fullPhone,
    type: mediaType,
    [mediaType]: mediaPayload,
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Missing required env vars");
    }

    const auth = await authorize(req, SERVICE_KEY);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { token: WA_TOKEN, phoneNumberId: PHONE_ID } = await getMetaCredentials(supabase);
    if (!WA_TOKEN || !PHONE_ID) {
      throw new Error("WHATSAPP_TOKEN or PHONE_NUMBER_ID not configured");
    }

    const {
      conversation_id,
      customer_id,
      phone_number,
      country_code,
      media_path,
      media_type,
      media_mime_type,
      media_size_bytes,
      caption,
    } = await req.json() as {
      conversation_id?: string;
      customer_id?: string | null;
      phone_number?: string;
      country_code?: string;
      media_path?: string;
      media_type?: "image" | "audio" | "video" | "document";
      media_mime_type?: string;
      media_size_bytes?: number;
      caption?: string;
    };

    if (!phone_number || !media_path || !media_type || !media_mime_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone_number, media_path, media_type, media_mime_type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (!["image", "audio", "video", "document"].includes(media_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid media_type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const cc = (country_code ?? "57").replace(/\D/g, "");
    let phone = String(phone_number).replace(/\D/g, "");
    if (phone.startsWith(cc) && phone.length > 10) phone = phone.slice(cc.length);
    const fullPhone = cc + phone;

    // 1. Bajar archivo de Storage
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from(WHATSAPP_MEDIA_BUCKET)
      .download(media_path);
    if (dlErr || !fileBlob) {
      throw new Error(`Storage download failed: ${dlErr?.message ?? "no data"}`);
    }
    const buffer = new Uint8Array(await fileBlob.arrayBuffer());

    // 2. Subir a Meta
    let metaMediaId: string;
    try {
      metaMediaId = await uploadBufferToMeta(PHONE_ID, WA_TOKEN, buffer, media_mime_type);
    } catch (err) {
      console.error("[upload-and-send-media] Meta upload error:", err);
      return new Response(
        JSON.stringify({ success: false, error: (err as Error).message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // 3. Enviar mensaje
    const sendResult = await sendMediaMessage(
      PHONE_ID,
      WA_TOKEN,
      fullPhone,
      media_type,
      metaMediaId,
      caption ?? null,
    );

    // 4. Upsert conversación + INSERT mensaje
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

    const status = sendResult.messageId ? "sent" : "failed";
    const previewByType: Record<string, string> = {
      image:    "[Imagen]",
      audio:    "[Audio]",
      video:    "[Video]",
      document: "[Documento]",
    };
    const contentForRow = caption ?? previewByType[media_type] ?? `[${media_type}]`;

    const { data: inserted, error: insErr } = await supabase
      .from("whatsapp_messages")
      .insert({
        conversation_id: convId,
        customer_id: customer_id ?? null,
        direction: "outbound",
        message_type: media_type,
        content: contentForRow,
        waba_message_id: sendResult.messageId,
        status,
        error_message: sendResult.error ?? null,
        error_code: sendResult.errorCode ?? null,
        error_title: sendResult.errorTitle ?? null,
        failed_at: sendResult.messageId ? null : new Date().toISOString(),
        sent_at: new Date().toISOString(),
        media_url: media_path,
        media_mime_type: media_mime_type,
        media_size_bytes: media_size_bytes ?? null,
        media_caption: caption ?? null,
      } as any)
      .select("id")
      .single();

    if (insErr) {
      console.error("[upload-and-send-media] insert error:", insErr);
    }

    if (sendResult.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: sendResult.error,
          message_row_id: inserted?.id ?? null,
          conversation_id: convId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: sendResult.messageId,
        message_row_id: inserted?.id ?? null,
        conversation_id: convId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("[upload-and-send-media] error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
