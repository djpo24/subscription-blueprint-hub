import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { PackagesPanel } from "./PackagesPanel";
import type { Conversation, Message, StatusFilter, ConversationCustomer } from "./types";

const PAGE_SIZE_MESSAGES = 150;
const PAGE_SIZE_CONVS    = 200;

function useIsBelowLg() {
  const [below, setBelow] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setBelow(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return below;
}

export function ConversationsPage() {
  const isMobile = useIsMobile();
  const isBelowLg = useIsBelowLg();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<Array<{ id: string; content: string; author_name: string | null; created_at: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;

  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from("whatsapp_conversation_inbox" as any)
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(PAGE_SIZE_CONVS);
    if (error) {
      console.error("[chat] fetchConversations error:", error);
      toast.error("No se pudieron cargar las conversaciones");
      setConvsLoading(false);
      return;
    }
    setConversations((data ?? []) as unknown as Conversation[]);
    setConvsLoading(false);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("sent_at", { ascending: true })
      .limit(PAGE_SIZE_MESSAGES);
    if (error) {
      console.error("[chat] fetchMessages error:", error);
      toast.error("No se pudieron cargar los mensajes");
      setMessages([]);
    } else {
      setMessages((data ?? []) as Message[]);
    }
    setMessagesLoading(false);
  }, []);

  const fetchNotes = useCallback(async (convId: string) => {
    const { data, error } = await supabase
      .from("conversation_notes")
      .select("id, content, author_name, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[chat] fetchNotes error:", error);
      return;
    }
    setNotes((data ?? []) as any);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setNotes([]);
      return;
    }
    fetchMessages(selectedId);
    fetchNotes(selectedId);
    supabase.rpc("mark_conversation_read", { p_conversation_id: selectedId } as any)
      .then(({ error }) => {
        if (error) {
          console.warn("[chat] mark_conversation_read failed:", error.message);
        } else {
          setConversations(prev =>
            prev.map(c => c.id === selectedId ? { ...c, last_read_at: new Date().toISOString(), unread_count: 0 } : c)
          );
        }
      });
  }, [selectedId, fetchMessages, fetchNotes]);

  // Bloquear scroll del body cuando se abre el chat full-screen en mobile
  useEffect(() => {
    if (isMobile && selectedId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, selectedId]);

  useEffect(() => {
    const channel = supabase
      .channel("whatsapp-realtime")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "whatsapp_messages" },
        (payload: any) => {
          const m = payload.new as Message;
          if (m.conversation_id === selectedRef.current) {
            setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
          }
          fetchConversations();
        },
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "whatsapp_messages" },
        (payload: any) => {
          const m = payload.new as Message;
          if (m.conversation_id === selectedRef.current) {
            setMessages(prev => prev.map(x => x.id === m.id ? m : x));
          }
          fetchConversations();
        },
      )
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "whatsapp_conversations" },
        () => fetchConversations(),
      )
      .subscribe();

    // Mobile (iOS Safari) pausa WebSockets cuando el tab pasa a background.
    // Al volver al tab refrescamos manualmente y reconectamos el canal.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchConversations();
        if (selectedRef.current) fetchMessages(selectedRef.current);
        // Reconectar el canal si Supabase lo cerró por inactividad
        try { channel.subscribe(); } catch { /* noop */ }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    // Polling de respaldo cada 20s como red de seguridad por si Realtime se
    // pierde en background (no es ruidoso porque solo hace 1 query a la VIEW).
    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConversations();
      }
    }, 20000);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(pollId);
    };
  }, [fetchConversations, fetchMessages]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (statusFilter === "unread")        list = list.filter(c => (c.unread_count ?? 0) > 0);
    else if (statusFilter === "awaiting") list = list.filter(c => c.awaiting_reply);
    else if (statusFilter === "open")     list = list.filter(c => c.status === "open");
    else if (statusFilter === "closed")   list = list.filter(c => c.status === "closed");

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(c => {
        const name = c.customers?.name?.toLowerCase() ?? "";
        const phone = c.phone_number.toLowerCase();
        return name.includes(q) || phone.includes(q);
      });
    }
    return list;
  }, [conversations, searchQuery, statusFilter]);

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0),
    [conversations],
  );
  const awaitingCount = useMemo(
    () => conversations.filter(c => c.awaiting_reply).length,
    [conversations],
  );

  const selectedConv = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const handleSendReply = useCallback(async () => {
    if (!selectedConv || !replyText.trim() || sending) return;
    setSending(true);

    // El phone_number en whatsapp_conversations ya está en E.164 sin "+".
    // Lo enviamos íntegro al edge function, que decide cómo formatearlo.
    const phoneRaw = selectedConv.phone_number.replace(/\D/g, "");

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversation_id: selectedConv.id,
      direction: "outbound",
      content: replyText.trim(),
      message_type: "text",
      status: "pending",
      sent_at: new Date().toISOString(),
      delivered_at: null,
      read_at: null,
      waba_message_id: null,
      error_code: null,
      error_title: null,
      error_message: null,
      error_message_es: null,
      failed_at: null,
      media_url: null,
      media_mime_type: null,
      media_size_bytes: null,
      media_caption: null,
      media_duration_sec: null,
    };
    setMessages(prev => [...prev, optimistic]);
    const text = replyText.trim();
    setReplyText("");

    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: {
          customer_id: selectedConv.customer_id,
          phone_number: phoneRaw,
          text,
          conversation_id: selectedConv.id,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Envío falló");

      // En vez de borrar el optimista (que crea un parpadeo si Realtime tarda),
      // lo transformamos en el mensaje real adoptando su id + waba_message_id.
      // Cuando llegue el evento de Realtime con el mismo id, el dedup natural
      // (some(x => x.id === m.id)) lo descartará.
      const realId = data.message_row_id as string | undefined;
      setMessages(prev => prev.map(m => m.id === tempId
        ? {
            ...m,
            id: realId ?? m.id,
            status: "sent",
            waba_message_id: data.message_id ?? null,
          }
        : m,
      ));
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(`Error: ${msg}`);
      setMessages(prev => prev.map(m => m.id === tempId
        ? { ...m, status: "failed", error_message: msg, error_message_es: msg }
        : m,
      ));
    } finally {
      setSending(false);
    }
  }, [selectedConv, replyText, sending]);

  const handleMarkUnread = useCallback(async () => {
    if (!selectedConv) return;
    const { error } = await supabase.rpc("mark_conversation_unread", { p_conversation_id: selectedConv.id } as any);
    if (error) {
      toast.error("No se pudo marcar como no leída");
      return;
    }
    toast.success("Marcada como no leída");
    setSelectedId(null);
    fetchConversations();
  }, [selectedConv, fetchConversations]);

  const handleAddNote = useCallback(async () => {
    if (!selectedConv || !newNote.trim() || savingNote) return;
    setSavingNote(true);
    const { data: userData } = await supabase.auth.getUser();
    const authorName = userData.user?.email ?? null;
    const authorId   = userData.user?.id ?? null;
    const { data, error } = await supabase
      .from("conversation_notes")
      .insert({
        conversation_id: selectedConv.id,
        author_id: authorId,
        author_name: authorName,
        content: newNote.trim(),
      })
      .select("id, content, author_name, created_at")
      .single();
    setSavingNote(false);
    if (error || !data) {
      toast.error("No se pudo guardar la nota");
      return;
    }
    setNotes(prev => [data as any, ...prev]);
    setNewNote("");
  }, [selectedConv, newNote, savingNote]);

  const customerForPanel: ConversationCustomer | null = selectedConv?.customers ?? null;

  // ─── Layout ──────────────────────────────────────────────────────────────
  // Mobile  (<md): full-screen overlay cuando hay conversación seleccionada;
  //               lista full-screen cuando no.
  // Tablet  (md):  split 2-col (lista 320px + chat). Panel de paquetes en Sheet.
  // Desktop (lg+): split 3-col (lista + chat + panel de paquetes lateral).

  const isChatOpen = !!selectedConv;
  const mobileOverlay = isMobile && isChatOpen;

  const containerCls = mobileOverlay
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : isMobile
      ? "flex flex-col bg-background h-[calc(100vh-130px)] min-h-[400px] overflow-hidden"
      : "flex flex-row bg-background h-[calc(100vh-180px)] min-h-[500px] md:border md:border-border md:rounded-lg overflow-hidden";

  return (
    <>
      <div className={containerCls}>
        {/* Lista — siempre visible en md+; en mobile solo cuando NO hay chat abierto */}
        {(!mobileOverlay) && (
          <ConversationList
            conversations={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={convsLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalUnread={totalUnread}
            awaitingCount={awaitingCount}
          />
        )}

        {selectedConv ? (
          <>
            <ChatWindow
              conversation={selectedConv}
              messages={messages}
              messagesLoading={messagesLoading}
              sending={sending}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSendReply={handleSendReply}
              onBack={() => setSelectedId(null)}
              showInfoPanel={showInfoPanel}
              onToggleInfoPanel={() => setShowInfoPanel(s => !s)}
              showNotes={showNotes}
              onToggleNotes={() => setShowNotes(s => !s)}
              notes={notes}
              newNote={newNote}
              onNewNoteChange={setNewNote}
              onAddNote={handleAddNote}
              savingNote={savingNote}
              onMarkUnread={handleMarkUnread}
              onMediaSent={() => selectedConv && fetchMessages(selectedConv.id)}
            />
            {/* Desktop: panel lateral */}
            {showInfoPanel && (
              <PackagesPanel
                customer={customerForPanel}
                phoneNumber={selectedConv.phone_number}
                onClose={() => setShowInfoPanel(false)}
                variant="side"
              />
            )}
          </>
        ) : (
          // Solo en md+ cuando no hay chat seleccionado mostramos el placeholder
          !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageCircle className="h-12 w-12 opacity-20" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          )
        )}
      </div>

      {/* Mobile/Tablet: panel de paquetes como Sheet (slide-in derecha) */}
      <Sheet
        open={showInfoPanel && isChatOpen && isBelowLg}
        onOpenChange={(open) => setShowInfoPanel(open)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden">
          {selectedConv && (
            <PackagesPanel
              customer={customerForPanel}
              phoneNumber={selectedConv.phone_number}
              variant="sheet"
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
