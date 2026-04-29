import { useEffect, useState } from "react";
import { FileText, Download, Image as ImageIcon, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "whatsapp-media";
const SIGN_EXPIRES_SEC = 60 * 60;
const CACHE_TTL_MS     = 50 * 60 * 1000;

interface CacheEntry { url: string; expiresAt: number }
const signedUrlCache = new Map<string, CacheEntry>();

async function getSignedUrl(path: string): Promise<string | null> {
  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGN_EXPIRES_SEC);
  if (error || !data?.signedUrl) {
    console.warn("[MessageMedia] createSignedUrl failed:", error?.message, path);
    return null;
  }
  signedUrlCache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return data.signedUrl;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromPath(path: string): string {
  const last = path.split("/").pop() ?? path;
  return last.length > 40 ? last.slice(0, 18) + "…" + last.slice(-15) : last;
}

function ImageBubble({ url, onOpen }: { url: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="block max-w-[260px] rounded-xl overflow-hidden border border-black/5 hover:opacity-95 transition-opacity"
      aria-label="Abrir imagen"
    >
      <img src={url} alt="" className="w-full h-auto block" loading="lazy" />
    </button>
  );
}

function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={url}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function AudioBubble({ url, durationSec }: { url: string; durationSec?: number | null }) {
  const mm = durationSec ? Math.floor(durationSec / 60) : null;
  const ss = durationSec ? String(durationSec % 60).padStart(2, "0") : null;
  return (
    <div className="min-w-[220px]">
      <audio controls src={url} className="w-full h-10">Tu navegador no soporta audio.</audio>
      {mm !== null && <div className="text-[10px] mt-0.5 opacity-70">{mm}:{ss}</div>}
    </div>
  );
}

function VideoBubble({ url }: { url: string }) {
  return (
    <video controls src={url} className="max-w-[280px] max-h-[320px] rounded-lg block">
      Tu navegador no soporta video.
    </video>
  );
}

function DocumentBubble({
  url, path, sizeBytes, isOut,
}: { url: string; path: string; sizeBytes: number | null | undefined; isOut: boolean }) {
  const name = fileNameFromPath(path);
  const size = formatBytes(sizeBytes);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors min-w-[200px] ${
        isOut
          ? "bg-white/10 border-white/20 hover:bg-white/15"
          : "bg-background border-border hover:bg-muted"
      }`}
    >
      <FileText className={`h-7 w-7 shrink-0 ${isOut ? "text-white/80" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${isOut ? "text-white" : "text-foreground"}`}>{name}</div>
        {size && (
          <div className={`text-[10px] ${isOut ? "text-white/60" : "text-muted-foreground"}`}>{size}</div>
        )}
      </div>
      <Download className={`h-4 w-4 shrink-0 ${isOut ? "text-white/60" : "text-muted-foreground"}`} />
    </a>
  );
}

interface MessageMediaProps {
  path: string;
  mimeType: string;
  sizeBytes?: number | null;
  caption?: string | null;
  durationSec?: number | null;
  isOut: boolean;
}

export function MessageMedia({ path, mimeType, sizeBytes, caption, durationSec, isOut }: MessageMediaProps) {
  const [signed, setSigned] = useState<string | null>(null);
  const [error, setError]   = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(false);
    setSigned(null);
    getSignedUrl(path).then((url) => {
      if (!alive) return;
      if (url) setSigned(url);
      else     setError(true);
    });
    return () => { alive = false; };
  }, [path]);

  if (error) {
    return (
      <div className={`flex items-center gap-1.5 text-[11px] ${isOut ? "text-white/70" : "text-muted-foreground"}`}>
        <AlertTriangle className="h-3 w-3" />
        <span>Media no disponible</span>
      </div>
    );
  }

  if (!signed) {
    return (
      <div className={`flex items-center gap-1.5 text-[11px] ${isOut ? "text-white/70" : "text-muted-foreground"}`}>
        <ImageIcon className="h-3 w-3 animate-pulse" />
        <span>Cargando…</span>
      </div>
    );
  }

  const m = (mimeType || "").toLowerCase();
  let body: React.ReactNode;
  if (m.startsWith("image/"))      body = <ImageBubble url={signed} onOpen={() => setLightbox(true)} />;
  else if (m.startsWith("audio/")) body = <AudioBubble url={signed} durationSec={durationSec} />;
  else if (m.startsWith("video/")) body = <VideoBubble url={signed} />;
  else                             body = <DocumentBubble url={signed} path={path} sizeBytes={sizeBytes ?? null} isOut={isOut} />;

  return (
    <div className="space-y-1">
      {body}
      {caption && (
        <div className={`text-xs leading-relaxed whitespace-pre-wrap break-words ${isOut ? "text-white" : "text-foreground"}`}>
          {caption}
        </div>
      )}
      {lightbox && signed && m.startsWith("image/") && (
        <ImageLightbox url={signed} onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}
