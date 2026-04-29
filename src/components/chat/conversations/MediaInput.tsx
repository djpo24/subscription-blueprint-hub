import { useEffect, useRef, useState } from "react";
import { Paperclip, Mic, Square, X, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "whatsapp-media";

const LIMITS = {
  image:    16 * 1024 * 1024,
  video:    16 * 1024 * 1024,
  audio:    16 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};

function classifyMime(mime: string): "image" | "audio" | "video" | "document" {
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("video/")) return "video";
  return "document";
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.startsWith("image/jpeg")) return "jpg";
  if (m.startsWith("image/png"))  return "png";
  if (m.startsWith("image/webp")) return "webp";
  if (m.startsWith("audio/ogg"))  return "ogg";
  if (m.startsWith("audio/webm")) return "webm";
  if (m.startsWith("audio/mpeg")) return "mp3";
  if (m.startsWith("audio/mp4"))  return "m4a";
  if (m.startsWith("video/mp4"))  return "mp4";
  if (m === "application/pdf")    return "pdf";
  const sub = m.split("/")[1] ?? "bin";
  return sub.replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin";
}

function uuid(): string {
  const c = (globalThis.crypto as Crypto | undefined);
  if (c?.randomUUID) return c.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface PendingMedia {
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  kind: "image" | "audio" | "video" | "document";
  previewUrl: string;
  fileName: string;
  durationSec?: number;
}

export interface MediaInputProps {
  conversationId: string;
  customerId: string | null;
  phoneLocal: string;
  countryCode: string;
  disabled: boolean;
  onSent: () => void;
}

export function MediaInput({
  conversationId, customerId, phoneLocal, countryCode, disabled, onSent,
}: MediaInputProps) {
  const [pending, setPending]   = useState<PendingMedia | null>(null);
  const [caption, setCaption]   = useState("");
  const [sending, setSending]   = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef  = useRef<Blob[]>([]);
  const recordStartedRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const kind = classifyMime(file.type);
    const limit = LIMITS[kind];
    if (file.size > limit) {
      toast.error(`Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo ${(limit / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPending({
      blob: file, mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size, kind, previewUrl, fileName: file.name,
    });
  }

  async function startRecording() {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      recordChunksRef.current = [];
      recordStartedRef.current = Date.now();
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const elapsed = Math.round((Date.now() - recordStartedRef.current) / 1000);
        const chunkMime = mr.mimeType || mime || "audio/webm";
        const blob = new Blob(recordChunksRef.current, { type: chunkMime });
        const previewUrl = URL.createObjectURL(blob);
        setPending({
          blob, mimeType: chunkMime, sizeBytes: blob.size, kind: "audio",
          previewUrl, fileName: `audio_${Date.now()}.${extFromMime(chunkMime)}`,
          durationSec: elapsed,
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      toast.error(`No se pudo acceder al micrófono: ${(err as Error)?.message ?? ""}`);
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state !== "inactive") mr.stop();
    setRecording(false);
  }

  function cancelPending() {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setCaption("");
  }

  async function send() {
    if (!pending || sending) return;
    setSending(true);
    try {
      const ext = extFromMime(pending.mimeType);
      const path = `${conversationId}/${uuid()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, pending.blob, { contentType: pending.mimeType, upsert: false });
      if (upErr) throw new Error(`Upload Storage: ${upErr.message}`);

      const { data, error } = await supabase.functions.invoke("whatsapp-upload-and-send-media", {
        body: {
          conversation_id: conversationId,
          customer_id: customerId,
          phone_number: phoneLocal,
          country_code: countryCode,
          media_path: path,
          media_type: pending.kind,
          media_mime_type: pending.mimeType,
          media_size_bytes: pending.sizeBytes,
          caption: caption.trim() || undefined,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Envío falló");

      toast.success("Enviado ✓");
      cancelPending();
      onSent();
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  }

  if (pending) {
    return (
      <div className="flex flex-col gap-2 px-2 py-2 border border-border rounded-2xl bg-muted/30">
        <div className="flex items-center gap-3">
          {pending.kind === "image" && <img src={pending.previewUrl} alt="" className="h-16 w-16 object-cover rounded-lg" />}
          {pending.kind === "audio" && <audio src={pending.previewUrl} controls className="h-10 flex-1 max-w-[260px]" />}
          {pending.kind === "video" && <video src={pending.previewUrl} className="h-16 w-24 object-cover rounded-lg" />}
          {pending.kind === "document" && (
            <div className="flex-1 text-xs text-foreground truncate">
              📄 {pending.fileName} <span className="text-muted-foreground">({(pending.sizeBytes / 1024).toFixed(1)} KB)</span>
            </div>
          )}
          <button
            type="button"
            onClick={cancelPending}
            disabled={sending}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(pending.kind === "image" || pending.kind === "video" || pending.kind === "document") && (
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Descripción (opcional)…"
              disabled={sending}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
            />
          )}
          {pending.kind === "audio" && <div className="flex-1" />}
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="p-2.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 active:scale-95 transition-all"
            aria-label="Enviar media"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,application/pdf"
        capture="environment"
        onChange={onFileSelected}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || recording}
        title="Adjuntar archivo"
        className="p-2.5 rounded-2xl text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Adjuntar archivo"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        title={recording ? "Detener grabación" : "Grabar audio"}
        className={`p-2.5 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          recording ? "bg-red-500 text-white animate-pulse" : "text-muted-foreground hover:bg-muted"
        }`}
        aria-label={recording ? "Detener grabación" : "Grabar audio"}
      >
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>
    </div>
  );
}
