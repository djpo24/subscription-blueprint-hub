// ─────────────────────────────────────────────────────────────────────────────
// whatsapp-media.ts — Helpers compartidos para media de WhatsApp.
//
// Lo importan tanto el webhook (descarga inbound) como
// whatsapp-upload-and-send-media (subida outbound).
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WA_API_BASE = "https://graph.facebook.com/v19.0";
export const WHATSAPP_MEDIA_BUCKET = "whatsapp-media";

export function extFromMime(mime: string): string {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/jpeg")) return "jpg";
  if (m.startsWith("image/png"))  return "png";
  if (m.startsWith("image/webp")) return "webp";
  if (m.startsWith("image/gif"))  return "gif";
  if (m.startsWith("audio/ogg"))  return "ogg";
  if (m.startsWith("audio/mpeg")) return "mp3";
  if (m.startsWith("audio/mp4"))  return "m4a";
  if (m.startsWith("audio/aac"))  return "aac";
  if (m.startsWith("audio/amr"))  return "amr";
  if (m.startsWith("video/mp4"))  return "mp4";
  if (m.startsWith("video/3gpp")) return "3gp";
  if (m === "application/pdf")    return "pdf";
  const sub = m.split("/")[1] ?? "bin";
  return sub.replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin";
}

export interface DownloadMediaResult {
  path: string;
  mime_type: string;
  size_bytes: number;
}

export async function downloadMetaMediaToStorage(
  supabase: ReturnType<typeof createClient>,
  whatsappToken: string,
  mediaId: string,
  conversationId: string | null,
  fileBaseName: string,
): Promise<DownloadMediaResult> {
  const metaRes = await fetch(`${WA_API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${whatsappToken}` },
  });
  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Meta media metadata fetch failed (${metaRes.status}): ${errText}`);
  }
  const meta = await metaRes.json() as {
    url: string;
    mime_type: string;
    file_size?: number;
  };

  const binRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${whatsappToken}` },
  });
  if (!binRes.ok) {
    const errText = await binRes.text();
    throw new Error(`Meta media binary fetch failed (${binRes.status}): ${errText}`);
  }
  const buffer = new Uint8Array(await binRes.arrayBuffer());
  const sizeBytes = buffer.byteLength;

  const ext = extFromMime(meta.mime_type);
  const folder = conversationId ?? "orphan";
  const path = `${folder}/${fileBaseName}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(WHATSAPP_MEDIA_BUCKET)
    .upload(path, buffer, {
      contentType: meta.mime_type,
      upsert: false,
    });

  if (upErr) {
    const msg = (upErr as { message?: string }).message ?? "";
    if (!msg.toLowerCase().includes("already exists") &&
        !msg.toLowerCase().includes("duplicate")) {
      throw new Error(`Storage upload failed: ${msg}`);
    }
  }

  return { path, mime_type: meta.mime_type, size_bytes: sizeBytes };
}

export async function uploadBufferToMeta(
  phoneNumberId: string,
  whatsappToken: string,
  buffer: Uint8Array,
  mimeType: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", new Blob([buffer], { type: mimeType }), "upload");
  formData.append("type", mimeType);

  const res = await fetch(`${WA_API_BASE}/${phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${whatsappToken}` },
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Meta media upload failed (${res.status}): ${errText}`);
  }
  const data = await res.json() as { id: string };
  if (!data.id) throw new Error("Meta upload returned no media id");
  return data.id;
}

export async function verifyMetaWebhookSignature(
  appSecret: string,
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!appSecret || !signatureHeader) return false;
  const sigHex = signatureHeader.replace(/^sha256=/, "").trim();
  if (!sigHex) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computed.length !== sigHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ sigHex.charCodeAt(i);
  }
  return diff === 0;
}

export function findCustomerMatch<T extends { phone?: string | null; whatsapp_number?: string | null }>(
  candidates: T[] | null | undefined,
  fromPhone: string,
): T | null {
  if (!candidates || candidates.length === 0) return null;
  const cleanFrom = fromPhone.replace(/[^\d]/g, "");
  return candidates.find(c => {
    const p = ((c.whatsapp_number || c.phone) ?? "").replace(/[^\d]/g, "");
    if (!p) return false;
    return p === cleanFrom || p.endsWith(cleanFrom) || cleanFrom.endsWith(p);
  }) ?? candidates[0];
}
