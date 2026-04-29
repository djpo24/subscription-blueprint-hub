import { useRef, useEffect } from "react";
import {
  MessageCircle, Send, Check, CheckCheck,
  PanelRight, StickyNote, ChevronLeft, AlertTriangle, MailPlus,
} from "lucide-react";
import type { Conversation, Message } from "./types";
import { MessageMedia } from "./MessageMedia";
import { MediaInput } from "./MediaInput";

function fmtTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function buildFullPhone(conv: Conversation) {
  const cc = "57";
  let raw = conv.phone_number.replace(/\D/g, "");
  if (raw.startsWith(cc) && raw.length > 10) raw = raw.slice(cc.length);
  return { fullPhone: cc + raw, localPhone: raw, cc };
}

function MsgTicks({ status }: { status: string | null }) {
  if (status === "read")      return <CheckCheck className="h-3 w-3 text-blue-300 inline ml-1" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3 text-white/50 inline ml-1" />;
  if (status === "sent")      return <Check className="h-3 w-3 text-white/50 inline ml-1" />;
  if (status === "failed")    return <AlertTriangle className="h-3 w-3 text-red-300 inline ml-1" />;
  return null;
}

function MsgFailureBadge({
  errorCode, errorTitle, errorMessage, errorMessageEs,
}: {
  errorCode: number | null;
  errorTitle: string | null;
  errorMessage: string | null;
  errorMessageEs: string | null;
}) {
  const display =
    errorMessageEs?.trim() ||
    (errorCode ? `Error ${errorCode}` : null) ||
    errorMessage?.trim() ||
    "No entregado";

  const tooltipParts: string[] = [];
  if (errorCode != null) tooltipParts.push(`Código: ${errorCode}`);
  if (errorTitle) tooltipParts.push(`Título: ${errorTitle}`);
  if (errorMessage && errorMessage !== display) tooltipParts.push(`Detalle: ${errorMessage}`);
  const tooltip = tooltipParts.join("\n") || display;

  return (
    <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-red-500/90" title={tooltip}>
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>No entregado: <span className="font-medium">{display}</span></span>
    </div>
  );
}

export interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  messagesLoading: boolean;
  sending: boolean;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: () => void;
  onBack: () => void;
  showInfoPanel: boolean;
  onToggleInfoPanel: () => void;
  showNotes: boolean;
  onToggleNotes: () => void;
  notes: Array<{ id: string; content: string; author_name: string | null; created_at: string }>;
  newNote: string;
  onNewNoteChange: (v: string) => void;
  onAddNote: () => void;
  savingNote: boolean;
  onMarkUnread: () => void;
  onMediaSent: () => void;
}

export function ChatWindow({
  conversation, messages, messagesLoading, sending,
  replyText, onReplyTextChange, onSendReply, onBack,
  showInfoPanel, onToggleInfoPanel,
  showNotes, onToggleNotes, notes, newNote, onNewNoteChange, onAddNote, savingNote,
  onMarkUnread, onMediaSent,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNearBottom = useRef(true);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isNearBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [conversation.id]);

  function onMessagesScroll() {
    const el = messagesContainerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendReply(); }
  }

  const { fullPhone, localPhone, cc } = buildFullPhone(conversation);

  // Ventana de 24h: si el último inbound fue hace más de 24h, Meta no permite
  // enviar texto libre — solo plantillas. Como no usamos plantillas en este
  // proyecto, mostramos un aviso pero permitimos intentar el envío (Meta
  // devolverá error 131047 que el trigger traduce a español).
  const lastInbound = conversation.last_inbound_at ? new Date(conversation.last_inbound_at).getTime() : 0;
  const sessionActive = lastInbound > 0 && Date.now() - lastInbound < 24 * 60 * 60 * 1000;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Volver"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {conversation.customers?.profile_image_url && (
            <img
              src={conversation.customers.profile_image_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">
              {conversation.customers?.name ?? conversation.phone_number}
            </div>
            <div className="text-xs text-muted-foreground">+{fullPhone}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkUnread}
            title="Marcar como no leída"
            className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
          >
            <MailPlus className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleNotes}
            title={showNotes ? "Ocultar notas" : "Notas internas"}
            className={`relative p-1.5 rounded-lg transition-colors ${
              showNotes ? "bg-yellow-100 text-yellow-700" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <StickyNote className="h-4 w-4" />
            {notes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-500 text-[8px] text-white flex items-center justify-center font-bold">
                {notes.length}
              </span>
            )}
          </button>
          <button
            onClick={onToggleInfoPanel}
            title={showInfoPanel ? "Ocultar panel" : "Ver encomiendas del cliente"}
            className={`p-1.5 rounded-lg transition-colors ${
              showInfoPanel ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <div className="border-b border-border bg-yellow-50/50 px-5 py-3 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2">
            <input
              value={newNote}
              onChange={e => onNewNoteChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddNote(); } }}
              placeholder="Agregar nota interna..."
              className="flex-1 px-3 py-1.5 text-xs border border-yellow-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300/50"
            />
            <button
              onClick={onAddNote}
              disabled={savingNote || !newNote.trim()}
              className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 font-medium transition-colors"
            >
              {savingNote ? "..." : "Guardar"}
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="text-[10px] text-yellow-600/60 text-center py-1">Sin notas internas</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="text-xs bg-white border border-yellow-200 rounded-lg p-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-yellow-800 text-[10px]">{note.author_name ?? "—"}</span>
                  <span className="text-[9px] text-yellow-600/60">
                    {new Date(note.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-yellow-900 leading-relaxed">{note.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={onMessagesScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
        style={{ background: "hsl(var(--muted) / 0.3)" }}
      >
        {messagesLoading ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`h-10 rounded-2xl animate-pulse bg-muted ${i % 2 === 0 ? "w-48" : "w-40"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
            <MessageCircle className="h-8 w-8 opacity-20" />
            <p className="text-xs">Sin mensajes aún</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOut = msg.direction === "outbound";
            const prev = idx > 0 ? messages[idx - 1] : null;
            const showTime = !prev || !msg.sent_at || !prev.sent_at ||
              new Date(msg.sent_at).getTime() - new Date(prev.sent_at).getTime() > 5 * 60 * 1000;
            const isFailed = msg.status === "failed" || msg.error_code != null;

            return (
              <div key={msg.id}>
                {showTime && msg.sent_at && (
                  <div className="text-[10px] text-muted-foreground text-center py-2">
                    {new Date(msg.sent_at).toLocaleString("es-CO", {
                      weekday: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                )}
                <div className={`flex flex-col ${isOut ? "items-end" : "items-start"} mb-1`}>
                  <div className={`max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isOut
                      ? isFailed
                          ? "bg-primary/85 text-white rounded-tr-sm shadow-sm ring-1 ring-red-400/70"
                          : "bg-primary text-white rounded-tr-sm shadow-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.media_url && msg.media_mime_type ? (
                      <MessageMedia
                        path={msg.media_url}
                        mimeType={msg.media_mime_type}
                        sizeBytes={msg.media_size_bytes}
                        caption={msg.media_caption}
                        durationSec={msg.media_duration_sec}
                        isOut={isOut}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content ?? "[sin contenido]"}
                      </div>
                    )}
                    <div className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${
                      isOut ? "text-white/60 justify-end" : "text-muted-foreground"
                    }`}>
                      {fmtTime(msg.sent_at)}
                      {isOut && <MsgTicks status={msg.status} />}
                    </div>
                  </div>
                  {isOut && isFailed && (
                    <MsgFailureBadge
                      errorCode={msg.error_code}
                      errorTitle={msg.error_title}
                      errorMessage={msg.error_message}
                      errorMessageEs={msg.error_message_es}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply zone */}
      <div className="border-t border-border bg-card px-4 py-3 space-y-2 shrink-0">
        {!sessionActive && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>El cliente no ha escrito en las últimas 24h. Meta puede rechazar el envío de texto libre.</span>
          </div>
        )}
        <div className="flex gap-2 relative items-center">
          <MediaInput
            conversationId={conversation.id}
            customerId={conversation.customer_id}
            phoneLocal={localPhone}
            countryCode={cc}
            disabled={sending}
            onSent={onMediaSent}
          />
          <input
            ref={inputRef}
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una respuesta…"
            disabled={sending}
            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40 transition-all"
          />
          <button
            onClick={onSendReply}
            disabled={sending || !replyText.trim()}
            className="p-2.5 rounded-2xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all active:scale-95"
            aria-label="Enviar"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
