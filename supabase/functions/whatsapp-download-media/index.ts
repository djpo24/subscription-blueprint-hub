import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { downloadMetaMediaToStorage } from "../_shared/whatsapp-media.ts";

// ═══════════════════════════════════════════════════════════════════════════════
//  whatsapp-download-media
//
//  POST { media_id: string, conversation_id?: string, waba_message_id?: string }
//   → { path, mime_type, size_bytes }
//
//  Idempotente — si el archivo ya existe en Storage devuelve el path canónico.
// ═══════════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error("Missing required env vars");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? Deno.env.get("META_WHATSAPP_TOKEN") ?? "";
    if (!WHATSAPP_TOKEN) {
      const { data } = await supabase.rpc("get_app_secret", { secret_name: "META_WHATSAPP_TOKEN" });
      WHATSAPP_TOKEN = (data as string) ?? "";
    }
    if (!WHATSAPP_TOKEN) {
      throw new Error("WHATSAPP_TOKEN not configured");
    }

    const body = await req.json() as {
      media_id?: string;
      conversation_id?: string;
      waba_message_id?: string;
    };

    if (!body.media_id) {
      return new Response(JSON.stringify({ error: "media_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileBase = body.waba_message_id ?? body.media_id;

    const result = await downloadMetaMediaToStorage(
      supabase,
      WHATSAPP_TOKEN,
      body.media_id,
      body.conversation_id ?? null,
      fileBase,
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[whatsapp-download-media] error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
