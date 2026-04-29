import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { PackagesPanel } from "./PackagesPanel";
import type { Conversation, Message, StatusFilter, ConversationCustomer } from "./types";

const PAGE_SIZE_MESSAGES = 150;
const PAGE_SIZE_CONVS    = 200;

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<Array<{ id: string; content: string; author_name: string | null; created_at: string }>>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;

  // ── Cargar conversaciones desde la VIEW ────────────────────────────────────
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

  // ── Cargar mensajes de la conversación seleccionada ────────────────────────
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

  // ── Marcar como leída cuando se selecciona ────────────────────────────────
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
          // Actualizar localmente para feedback inmediato
          setConversations(prev =>
            prev.map(c => c.id === selectedId ? { ...c, last_read_at: new Date().toISOString(), unread_count: 0 } : c)
          );
        }
      });
  }, [selectedId, fetchMessages, fetchNotes]);

  // ── Realtime: nuevos mensajes y status updates ─────────────────────────────
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
          // Refrescar lista (unread, preview, last_message_at)
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
        },
      )
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "whatsapp_conversations" },
        () => fetchConversations(),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  // ── Filtrado client-side ───────────────────────────────────────────────────
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

  // ── Acciones ───────────────────────────────────────────────────────────────
  const handleSendReply = useCallback(async () => {
    if (!selectedConv || !replyText.trim() || sending) return;
    setSending(true);

    const cc = "57";
    let phoneRaw = selectedConv.phone_number.replace(/\D/g, "");
    if (phoneRaw.startsWith(cc) && phoneRaw.length > 10) phoneRaw = phoneRaw.slice(cc.length);

    // Optimistic insert
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
          country_code: cc,
          text,
          conversation_id: selectedConv.id,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? "Envío falló");
      // Quitar optimistic — el real va a llegar por Realtime
      setMessages(prev => prev.filter(m => m.id !== tempId));
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[500px] border border-border rounded-lg overflow-hidden bg-background">
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
          {showInfoPanel && (
            <PackagesPanel
              customer={customerForPanel}
              phoneNumber={selectedConv.phone_number}
              onClose={() => setShowInfoPanel(false)}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 hidden md:flex">
          <MessageCircle className="h-12 w-12 opacity-20" />
          <p className="text-sm">Selecciona una conversación</p>
        </div>
      )}
    </div>
  );
}
