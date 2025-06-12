
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string;
  message_content: string;
  timestamp: string;
}

interface MessageDetectionProps {
  isEnabled: boolean;
  onMessageDetected: (message: DetectedMessage) => void;
}

export function useMessageDetection({ isEnabled, onMessageDetected }: MessageDetectionProps) {
  const channelRef = useRef<any>(null);
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    console.log('🔍 Message detection effect triggered. Enabled:', isEnabled);

    // Cleanup previous channel
    if (channelRef.current) {
      console.log('🔕 Removing previous message detection channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!isEnabled) {
      console.log('🔍 Message detection disabled, skipping setup');
      return;
    }

    console.log('🔍 Setting up message detection...');

    // Create new channel for message detection
    const channel = supabase
      .channel('message-detection-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          console.log('📨 New message detected:', {
            id: newMessage.id,
            from: newMessage.from_phone,
            customerId: newMessage.customer_id,
            preview: newMessage.message_content?.substring(0, 50) + '...'
          });

          // Skip if already processed
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Message already processed, skipping');
            return;
          }

          // Skip if not from customer
          if (!newMessage.from_phone || !newMessage.customer_id) {
            console.log('⏭️ Message not from registered customer, skipping');
            return;
          }

          // Mark as processed immediately
          processedMessages.current.add(newMessage.id);

          // Trigger callback
          onMessageDetected({
            id: newMessage.id,
            from_phone: newMessage.from_phone,
            customer_id: newMessage.customer_id,
            message_content: newMessage.message_content || '',
            timestamp: newMessage.timestamp
          });
        }
      )
      .subscribe((status) => {
        console.log('🔍 Message detection channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Message detection channel subscribed successfully');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Message detection channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔕 Cleanup: Unsubscribing from message detection');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isEnabled, onMessageDetected]);

  return {
    isActive: isEnabled && !!channelRef.current,
    processedCount: processedMessages.current.size
  };
}
