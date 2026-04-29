import { Timer, Search } from "lucide-react";
import type { Conversation, StatusFilter } from "./types";

function fmtConvTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  totalUnread: number;
  awaitingCount: number;
}

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "unread",   label: "Sin leer" },
  { key: "awaiting", label: "Esperan" },
  { key: "all",      label: "Todas" },
  { key: "open",     label: "Abiertas" },
  { key: "closed",   label: "Cerradas" },
];

export function ConversationList({
  conversations, selectedId, onSelect, loading,
  searchQuery, onSearchChange, statusFilter, onStatusFilterChange,
  totalUnread, awaitingCount,
}: ConversationListProps) {
  return (
    <div className={`flex-col border-r border-border bg-card w-full md:w-80 md:shrink-0 ${selectedId ? "hidden md:flex" : "flex"}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-foreground">Conversaciones</h1>
          {awaitingCount > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              {awaitingCount} esperan respuesta
            </span>
          )}
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar nombre, teléfono…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map(({ key, label }) => {
            const isActive = statusFilter === key;
            const count =
              key === "unread"   ? totalUnread :
              key === "awaiting" ? awaitingCount :
              undefined;
            return (
              <button
                key={key}
                onClick={() => onStatusFilterChange(key)}
                className={`flex-shrink-0 px-2 py-1 text-[10px] rounded font-medium transition-colors flex items-center gap-1 min-h-[24px] ${
                  isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{label}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[16px] h-[14px] px-1 rounded-full text-[9px] font-bold leading-none ${
                      isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                    }`}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 border-b border-border/50 animate-pulse">
                <div className="h-3 bg-muted rounded w-32 mb-2" />
                <div className="h-2.5 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center pt-12">
            Sin conversaciones
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const unread = conv.unread_count ?? 0;
            const isUnread = unread > 0 && !isSelected;
            const awaitingReply = conv.awaiting_reply === true;
            const sla = awaitingReply ? conv.minutes_since_last_inbound : null;
            const slaColor =
              sla == null ? "text-muted-foreground" :
              sla > 60   ? "text-red-600" :
              sla > 15   ? "text-amber-600" :
              "text-muted-foreground";

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left p-3 border-b border-border/40 transition-colors relative min-h-[64px] border-l-2 ${
                  isSelected
                    ? "bg-primary/10 border-l-primary"
                    : isUnread
                    ? "bg-primary/5 hover:bg-primary/10 border-l-red-500"
                    : awaitingReply
                    ? "border-l-amber-400 hover:bg-muted/40"
                    : "border-l-transparent hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {conv.customers?.profile_image_url ? (
                    <img
                      src={conv.customers.profile_image_url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                      {(conv.customers?.name ?? conv.phone_number).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`text-xs truncate text-foreground ${isUnread ? "font-semibold" : "font-medium"}`}>
                        {conv.customers?.name ?? conv.phone_number}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{fmtConvTime(conv.last_message_at)}</span>
                        {isUnread && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${isUnread ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
                      {conv.last_message_preview ?? conv.phone_number}
                    </div>
                    {awaitingReply && !isSelected && (
                      <div className={`flex items-center gap-1 mt-1 ${slaColor}`}>
                        <Timer className="h-2.5 w-2.5" />
                        <span className="text-[9px] font-semibold">
                          {sla == null || sla < 1
                            ? "Esperando respuesta"
                            : sla < 60 ? `${sla} min sin respuesta`
                            : `${Math.floor(sla / 60)}h sin respuesta`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
