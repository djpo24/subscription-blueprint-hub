import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  downloadMetaMediaToStorage,
  findCustomerMatch,
  verifyMetaWebhookSignature,
} from "../_shared/whatsapp-media.ts";

// ═══════════════════════════════════════════════════════════════════════════════
//  whatsapp-webhook-v3 (unified chat)
//
//  GET  → verifica el webhook (Meta hub.verify_token)
//  POST → procesa eventos:
//          · value.messages   → mensajes entrantes (inbound)
//          · value.statuses   → status updates (sent/delivered/read/failed)
//          · value.contacts   → metadata de contacto (foto de perfil)
//
//  Cambios vs v3 legacy:
//    - Verifica HMAC X-Hub-Signature-256 si META_WHATSAPP_APP_SECRET está
//      disponible (modo seguro por defecto).
//    - Dedup por waba_message_id (no inserta dos veces el mismo mensaje).
//    - Escribe en whatsapp_conversations + whatsapp_messages (esquema nuevo).
//    - Descarga media a bucket whatsapp-media en folder = conversation_id.
//    - Status updates actualizan whatsapp_messages (delivered_at/read_at/
//      failed_at + error_code/title/message → trigger traduce a español).
//    - Mantiene la lógica de fetch de foto de perfil de WhatsApp y la
//      protección de "no crear clientes nuevos automáticamente".
// ═══════════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

// ─── Secrets resolver (env primero, luego app_secrets RPC) ───────────────────

async function getSecret(supabase: any, name: string, envFallback?: string): Promise<string> {
  const fromEnv = envFallback ? Deno.env.get(envFallback) : "";
  if (fromEnv) return fromEnv;
  try {
    const { data } = await supabase.rpc("get_app_secret", { secret_name: name });
    return (data as string) ?? "";
  } catch {
    return "";
  }
}

// ─── Foto de perfil (preservado del v3 legacy) ───────────────────────────────

async function getWhatsAppProfileImage(
  waId: string,
  phoneNumberId: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/contacts?contacts=${encodeURIComponent(waId)}`,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.contacts?.[0]?.profile?.profile_picture_url ?? null;
  } catch (err) {
    console.error("[webhook] getWhatsAppProfileImage error:", err);
    return null;
  }
}

async function downloadProfileImageToBucket(
  url: string,
  waId: string,
  supabase: any,
): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "image/jpeg";
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : ct.includes("gif") ? "gif" : "jpg";
    const path = `profiles/profile_${waId}_${Date.now()}.${ext}`;
    const buf = await res.arrayBuffer();
    const { error } = await supabase.storage.from("whatsapp-media").upload(path, buf, {
      contentType: ct,
      upsert: false,
    });
    if (error) return null;
    const { data: pub } = supabase.storage.from("whatsapp-media").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  } catch (err) {
    console.error("[webhook] downloadProfileImageToBucket error:", err);
    return null;
  }
}

async function refreshCustomerProfileImage(
  customer: any,
  waId: string,
  supabase: any,
  accessToken: string,
  phoneNumberId: string,
) {
  if (!customer) return;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (customer.profile_image_url && customer.updated_at) {
    if (new Date(customer.updated_at).getTime() > thirtyDaysAgo) return;
  }
  const profileUrl = await getWhatsAppProfileImage(waId, phoneNumberId, accessToken);
  if (!profileUrl) return;
  const permanentUrl = await downloadProfileImageToBucket(profileUrl, waId, supabase);
  if (permanentUrl && permanentUrl !== customer.profile_image_url) {
    await supabase
      .from("customers")
      .update({ profile_image_url: permanentUrl, updated_at: new Date().toISOString() })
      .eq("id", customer.id);
  }
}

// ─── Resolver conversación (upsert) y customer match ─────────────────────────

async function ensureConversation(
  supabase: any,
  fromPhone: string,
): Promise<{ conversationId: string; customer: any | null }> {
  // Buscar customer
  const { data: candidates } = await supabase
    .from("customers")
    .select("id, name, phone, whatsapp_number, profile_image_url, updated_at")
    .or(`phone.ilike.%${fromPhone}%,whatsapp_number.ilike.%${fromPhone}%`);

  const customer = findCustomerMatch(candidates, fromPhone);

  // Upsert conversación
  const { data: conv } = await supabase
    .from("whatsapp_conversations")
    .upsert(
      {
        phone_number: fromPhone,
        customer_id: customer?.id ?? null,
        status: "open",
        last_message_at: new Date().toISOString(),
      },
      { onConflict: "phone_number" },
    )
    .select("id, customer_id")
    .single();

  // Si el upsert no asignó customer_id pero tenemos uno, hacerlo ahora
  if (conv && !conv.customer_id && customer?.id) {
    await supabase
      .from("whatsapp_conversations")
      .update({ customer_id: customer.id })
      .eq("id", conv.id);
  }

  return { conversationId: conv?.id, customer };
}

// ─── Inbound message handling ────────────────────────────────────────────────

async function handleIncomingMessage(
  message: any,
  supabase: any,
  whatsappToken: string,
  phoneNumberId: string,
) {
  const wabaId: string = message.id;
  const fromPhone: string = message.from;
  const tsSec: number = parseInt(message.timestamp, 10);
  const sentAt = new Date(tsSec * 1000).toISOString();

  // Dedup
  const { data: existing } = await supabase
    .from("whatsapp_messages")
    .select("id")
    .eq("waba_message_id", wabaId)
    .maybeSingle();
  if (existing) {
    console.log(`[webhook] dedup: ${wabaId} already processed`);
    return;
  }

  const { conversationId, customer } = await ensureConversation(supabase, fromPhone);

  // Determinar tipo + contenido + media
  let messageType = message.type as string;
  let content = "";
  let mediaPath: string | null = null;
  let mediaMime: string | null = null;
  let mediaSize: number | null = null;
  let mediaCaption: string | null = null;

  const tryDownload = async (mediaId: string, captionFallback: string) => {
    try {
      const r = await downloadMetaMediaToStorage(
        supabase, whatsappToken, mediaId, conversationId, wabaId,
      );
      mediaPath = r.path;
      mediaMime = r.mime_type;
      mediaSize = r.size_bytes;
    } catch (err) {
      console.error(`[webhook] media download failed (${mediaId}):`, err);
      content = captionFallback;
    }
  };

  switch (messageType) {
    case "text":
      content = message.text?.body ?? "";
      break;
    case "image":
      mediaCaption = message.image?.caption ?? null;
      content = mediaCaption ?? "[Imagen]";
      if (message.image?.id) await tryDownload(message.image.id, "[Imagen]");
      break;
    case "audio":
      content = "[Audio]";
      if (message.audio?.id) await tryDownload(message.audio.id, "[Audio]");
      break;
    case "video":
      mediaCaption = message.video?.caption ?? null;
      content = mediaCaption ?? "[Video]";
      if (message.video?.id) await tryDownload(message.video.id, "[Video]");
      break;
    case "document":
      mediaCaption = message.document?.caption ?? null;
      content = mediaCaption ?? `[Documento: ${message.document?.filename ?? "archivo"}]`;
      if (message.document?.id) await tryDownload(message.document.id, content);
      break;
    case "sticker":
      messageType = "image";
      content = "[Sticker]";
      if (message.sticker?.id) await tryDownload(message.sticker.id, "[Sticker]");
      break;
    case "interactive":
      content = message.interactive?.button_reply?.title
             ?? message.interactive?.list_reply?.title
             ?? "[Mensaje interactivo]";
      break;
    case "reaction":
      content = `Reaccionó con ${message.reaction?.emoji ?? "👍"}`;
      messageType = "text";
      break;
    case "location":
      content = `📍 ${message.location?.latitude}, ${message.location?.longitude}`;
      messageType = "text";
      break;
    default:
      content = `Tipo no soportado: ${messageType}`;
      messageType = "text";
  }

  // Tipo válido para CHECK del schema
  if (!["text", "image", "audio", "video", "document", "interactive"].includes(messageType)) {
    messageType = "text";
  }

  const { error: insertErr } = await supabase
    .from("whatsapp_messages")
    .insert({
      conversation_id: conversationId,
      customer_id: customer?.id ?? null,
      direction: "inbound",
      message_type: messageType,
      content,
      waba_message_id: wabaId,
      status: "delivered",
      sent_at: sentAt,
      media_url: mediaPath,
      media_mime_type: mediaMime,
      media_size_bytes: mediaSize,
      media_caption: mediaCaption,
    });

  if (insertErr) {
    console.error("[webhook] insert whatsapp_messages error:", insertErr);
  } else {
    // Refrescar last_message_at
    await supabase
      .from("whatsapp_conversations")
      .update({ last_message_at: sentAt })
      .eq("id", conversationId);
  }

  // Foto de perfil (best-effort, no bloquea)
  if (customer && whatsappToken && phoneNumberId) {
    refreshCustomerProfileImage(customer, fromPhone, supabase, whatsappToken, phoneNumberId)
      .catch(err => console.error("[webhook] profile refresh error:", err));
  }
}

// ─── Status update handling (sent/delivered/read/failed) ─────────────────────

async function handleMessageStatus(status: any, supabase: any) {
  const wabaId: string | undefined = status.id;
  const stateRaw: string = status.status;
  const recipientId: string | undefined = status.recipient_id;
  const tsSec = parseInt(status.timestamp, 10);
  const ts = isFinite(tsSec) ? new Date(tsSec * 1000).toISOString() : new Date().toISOString();

  console.log(`[webhook] status update: id=${wabaId} state=${stateRaw} recipient=${recipientId}`);

  if (!wabaId || !stateRaw) {
    console.warn("[webhook] status missing id or state, skipping");
    return;
  }

  const updates: Record<string, any> = { status: stateRaw };
  if (stateRaw === "delivered") updates.delivered_at = ts;
  else if (stateRaw === "read") updates.read_at = ts;
  else if (stateRaw === "failed") {
    updates.failed_at = ts;
    const err = status.errors?.[0];
    if (err) {
      updates.error_code    = typeof err.code === "number" ? err.code : null;
      updates.error_title   = err.title ?? null;
      updates.error_message = err.message ?? err.error_data?.details ?? null;
    }
    console.error(`[webhook] FAILED status: ${JSON.stringify(status.errors ?? {})}`);
  }

  const { data: updated, error } = await supabase
    .from("whatsapp_messages")
    .update(updates)
    .eq("waba_message_id", wabaId)
    .select("id");

  if (error) {
    console.error("[webhook] status update error:", error);
    return;
  }

  if (!updated || updated.length === 0) {
    // Mensaje no encontrado por wamid (probablemente outbound enviado por
    // función que no persistió a whatsapp_messages). Hacemos un fallback:
    // creamos una fila inferida usando recipient_id para que al menos quede
    // registrado el envío con su estado.
    console.warn(`[webhook] no whatsapp_messages row for wamid=${wabaId}; recipient=${recipientId} → inserting placeholder`);

    if (recipientId) {
      try {
        const { data: conv } = await supabase
          .from("whatsapp_conversations")
          .upsert(
            {
              phone_number: recipientId,
              status: "open",
              last_message_at: ts,
            },
            { onConflict: "phone_number" },
          )
          .select("id")
          .single();

        await supabase.from("whatsapp_messages").insert({
          conversation_id: conv?.id ?? null,
          direction: "outbound",
          message_type: "text",
          content: "[Mensaje enviado por sistema]",
          waba_message_id: wabaId,
          status: stateRaw,
          sent_at: ts,
          delivered_at: stateRaw === "delivered" || stateRaw === "read" ? ts : null,
          read_at: stateRaw === "read" ? ts : null,
          failed_at: stateRaw === "failed" ? ts : null,
          error_code: updates.error_code ?? null,
          error_title: updates.error_title ?? null,
          error_message: updates.error_message ?? null,
        });
      } catch (insErr) {
        console.error("[webhook] placeholder insert error:", insErr);
      }
    }
  } else {
    console.log(`[webhook] updated ${updated.length} message(s) to status=${stateRaw}`);
  }
}

// ─── Contact handling (perfil de WhatsApp) ───────────────────────────────────

async function handleContact(contact: any, supabase: any, whatsappToken: string, phoneNumberId: string) {
  const waId = contact.wa_id;
  if (!waId) return;
  const profileName = contact.profile?.name as string | undefined;

  const { data: candidates } = await supabase
    .from("customers")
    .select("id, name, phone, whatsapp_number, profile_image_url, updated_at")
    .or(`phone.ilike.%${waId}%,whatsapp_number.ilike.%${waId}%`);

  const customer = findCustomerMatch(candidates, waId);
  if (!customer) return; // política: no crear clientes nuevos automáticamente

  const updates: Record<string, any> = {};
  if (!customer.whatsapp_number && waId) updates.whatsapp_number = waId;
  if (profileName && (!customer.name || customer.name === "Cliente" || customer.name === ".")) {
    updates.name = profileName;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("customers").update(updates).eq("id", customer.id);
  }

  if (whatsappToken && phoneNumberId) {
    await refreshCustomerProfileImage(customer, waId, supabase, whatsappToken, phoneNumberId);
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // ── GET: verification ──
    if (req.method === "GET") {
      const verifyToken = await getSecret(supabase, "META_WHATSAPP_VERIFY_TOKEN", "META_WHATSAPP_VERIFY_TOKEN")
                       || "ojitos_webhook_verify";
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === verifyToken) {
        return new Response(challenge ?? "", {
          status: 200,
          headers: { "Content-Type": "text/plain", ...corsHeaders },
        });
      }
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    // ── POST: read raw body for HMAC verification ──
    const rawBody = await req.text();

    const appSecret = await getSecret(supabase, "META_WHATSAPP_APP_SECRET", "META_WHATSAPP_APP_SECRET");
    const sigHeader = req.headers.get("x-hub-signature-256");

    if (appSecret) {
      const ok = await verifyMetaWebhookSignature(appSecret, rawBody, sigHeader);
      if (!ok) {
        console.warn("[webhook] HMAC verification failed");
        return new Response("Invalid signature", { status: 401, headers: corsHeaders });
      }
    } else {
      console.warn("[webhook] META_WHATSAPP_APP_SECRET not set — skipping HMAC verification");
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    if (!body?.entry || !Array.isArray(body.entry)) {
      console.log("[webhook] body has no entry array; ignoring");
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Resumen del payload para diagnóstico (sin contenido sensible)
    const summary = body.entry.map((e: any) =>
      (e.changes ?? []).map((c: any) => ({
        field: c.field,
        statuses: c.value?.statuses?.length ?? 0,
        messages: c.value?.messages?.length ?? 0,
        contacts: c.value?.contacts?.length ?? 0,
      }))
    );
    console.log("[webhook] payload summary:", JSON.stringify(summary));

    // Resolver credenciales una sola vez
    const whatsappToken = await getSecret(supabase, "META_WHATSAPP_TOKEN", "META_WHATSAPP_TOKEN");
    const phoneNumberId = await getSecret(supabase, "META_WHATSAPP_PHONE_NUMBER_ID", "META_WHATSAPP_PHONE_NUMBER_ID");

    for (const entry of body.entry) {
      if (!entry.changes) continue;
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        const value = change.value ?? {};

        if (Array.isArray(value.statuses)) {
          for (const s of value.statuses) {
            await handleMessageStatus(s, supabase);
          }
        }

        if (Array.isArray(value.messages)) {
          for (const m of value.messages) {
            try {
              await handleIncomingMessage(m, supabase, whatsappToken, phoneNumberId);
            } catch (err) {
              console.error("[webhook] handleIncomingMessage error:", err);
            }
          }
        }

        if (Array.isArray(value.contacts) && whatsappToken && phoneNumberId) {
          for (const c of value.contacts) {
            try {
              await handleContact(c, supabase, whatsappToken, phoneNumberId);
            } catch (err) {
              console.error("[webhook] handleContact error:", err);
            }
          }
        }
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("[webhook] fatal error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
