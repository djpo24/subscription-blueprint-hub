import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ChatWindow } from './conversations/ChatWindow';
import type { Conversation, Message } from './conversations/types';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  customerName?: string;
  phone?: string;
}

function normalizePhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return '57' + digits;
  return digits;
}

export function ChatDialog({ open, onOpenChange, customerId, customerName, phone }: ChatDialogProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setConversation(null);
      setMessages([]);
      setReplyText('');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);

      // Resolver teléfono: del customer si está, o el prop phone
      let targetPhone: string | null = normalizePhone(phone);
      let resolvedCustomer: Conversation['customers'] = null;

      if (customerId) {
        const { data: cu } = await supabase
          .from('customers')
          .select('id, name, email, phone, whatsapp_number, profile_image_url')
          .eq('id', customerId)
          .maybeSingle();
        if (cu) {
          resolvedCustomer = cu;
          targetPhone = targetPhone ?? normalizePhone(cu.whatsapp_number ?? cu.phone);
        }
      }

      if (!targetPhone) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Buscar conversación por customer_id o phone (matching flexible)
      let conv: Conversation | null = null;

      if (customerId) {
        const { data: byCustomer } = await supabase
          .from('whatsapp_conversation_inbox' as any)
          .select('*')
          .eq('customer_id', customerId)
          .order('last_message_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();
        if (byCustomer) conv = byCustomer as unknown as Conversation;
      }

      if (!conv) {
        const { data: candidates } = await supabase
          .from('whatsapp_conversation_inbox' as any)
          .select('*')
          .or(`phone_number.ilike.%${targetPhone}%,phone_number.eq.${targetPhone}`)
          .limit(5);
        const cleanTarget = targetPhone.replace(/\D/g, '');
        const match = (candidates as unknown as Conversation[] | null)?.find(c => {
          const p = c.phone_number.replace(/\D/g, '');
          return p === cleanTarget || p.endsWith(cleanTarget) || cleanTarget.endsWith(p);
        });
        if (match) conv = match;
      }

      if (!conv) {
        // Crear placeholder en memoria — la conversación real se crea al enviar
        conv = {
          id: '__pending__',
          phone_number: targetPhone,
          customer_id: customerId,
          status: 'open',
          last_message_at: null,
          customers: resolvedCustomer,
          last_read_at: null,
          last_read_by: null,
          unread_count: 0,
          last_inbound_at: null,
          last_outbound_at: null,
          awaiting_reply: false,
          minutes_since_last_inbound: null,
          last_message_preview: null,
        };
      } else if (!conv.customers && resolvedCustomer) {
        conv = { ...conv, customers: resolvedCustomer };
      }

      if (cancelled) return;
      setConversation(conv);

      if (conv.id !== '__pending__') {
        const { data: msgs } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: true })
          .limit(150);
        if (!cancelled) setMessages((msgs ?? []) as Message[]);

        // marcar leída
        supabase.rpc('mark_conversation_read', { p_conversation_id: conv.id } as any).then(() => {});
      } else {
        setMessages([]);
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [open, customerId, phone]);

  // Realtime para esta conversación
  useEffect(() => {
    if (!open || !conversation || conversation.id === '__pending__') return;
    const convId = conversation.id;
    const channel = supabase
      .channel(`chat-dialog-${convId}`)
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `conversation_id=eq.${convId}` },
        (payload: any) => {
          const m = payload.new as Message;
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        },
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'whatsapp_messages', filter: `conversation_id=eq.${convId}` },
        (payload: any) => {
          const m = payload.new as Message;
          setMessages(prev => prev.map(x => x.id === m.id ? m : x));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, conversation]);

  const handleSendReply = async () => {
    if (!conversation || !replyText.trim() || sending) return;
    setSending(true);
    const cc = '57';
    let phoneRaw = conversation.phone_number.replace(/\D/g, '');
    if (phoneRaw.startsWith(cc) && phoneRaw.length > 10) phoneRaw = phoneRaw.slice(cc.length);

    const text = replyText.trim();
    setReplyText('');
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          customer_id: conversation.customer_id,
          phone_number: phoneRaw,
          country_code: cc,
          text,
          conversation_id: conversation.id !== '__pending__' ? conversation.id : undefined,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error ?? 'Envío falló');

      // Si la conversación era pending, ahora tiene id real
      if (conversation.id === '__pending__' && data.conversation_id) {
        setConversation({ ...conversation, id: data.conversation_id });
        const { data: msgs } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('conversation_id', data.conversation_id)
          .order('sent_at', { ascending: true })
          .limit(150);
        setMessages((msgs ?? []) as Message[]);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const displayName = customerName || conversation?.customers?.name || 'Cliente';

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat con {displayName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[500px] flex">
          {loading || !conversation ? (
            <div className="flex justify-center items-center w-full py-12 text-muted-foreground text-sm">
              {loading ? 'Cargando...' : 'No se pudo cargar la conversación'}
            </div>
          ) : (
            <ChatWindow
              conversation={conversation}
              messages={messages}
              messagesLoading={false}
              sending={sending}
              replyText={replyText}
              onReplyTextChange={setReplyText}
              onSendReply={handleSendReply}
              onBack={() => onOpenChange(false)}
              showInfoPanel={false}
              onToggleInfoPanel={() => {}}
              showNotes={false}
              onToggleNotes={() => {}}
              notes={[]}
              newNote=""
              onNewNoteChange={() => {}}
              onAddNote={() => {}}
              savingNote={false}
              onMarkUnread={() => onOpenChange(false)}
              onMediaSent={() => {}}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
