import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string | null;
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const createChannel = () => {
    console.log('🔍 Creating new message detection channel...');
    
    const channel = supabase
      .channel(`message-detection-${Date.now()}`, {
        config: {
          presence: {
            key: 'user'
          }
        }
      })
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
            customerId: newMessage.customer_id || 'UNREGISTERED',
            preview: newMessage.message_content?.substring(0, 50) + '...'
          });

          // Skip if already processed
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Message already processed, skipping');
            return;
          }

          // Skip if no phone number
          if (!newMessage.from_phone) {
            console.log('⏭️ Message without phone number, skipping');
            return;
          }

          // Mark as processed
          processedMessages.current.add(newMessage.id);

          // Clean up old processed messages (keep only last 100)
          if (processedMessages.current.size > 100) {
            const entries = Array.from(processedMessages.current);
            const toKeep = entries.slice(-50);
            processedMessages.current.clear();
            toKeep.forEach(id => processedMessages.current.add(id));
          }

          // Trigger callback
          onMessageDetected({
            id: newMessage.id,
            from_phone: newMessage.from_phone,
            customer_id: newMessage.customer_id || null,
            message_content: newMessage.message_content || '',
            timestamp: newMessage.timestamp
          });
        }
      )
      .subscribe((status) => {
        console.log('🔍 Message detection channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Message detection channel connected successfully');
          isConnectedRef.current = true;
          
          // Clear any pending reconnection
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('❌ Message detection channel error/timeout:', status);
          isConnectedRef.current = false;
          
          // Attempt to reconnect after a delay
          if (isEnabled && !reconnectTimeoutRef.current) {
            console.log('🔄 Scheduling reconnection in 5 seconds...');
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Attempting to reconnect message detection...');
              reconnectTimeoutRef.current = null;
              
              // Clean up current channel
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
              }
              
              // Create new channel
              if (isEnabled) {
                channelRef.current = createChannel();
              }
            }, 5000);
          }
        }
      });

    return channel;
  };

  useEffect(() => {
    console.log('🔍 Message detection effect triggered. Enabled:', isEnabled);

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Cleanup previous channel
    if (channelRef.current) {
      console.log('🔕 Removing previous message detection channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isConnectedRef.current = false;
    }

    if (!isEnabled) {
      console.log('🔍 Message detection disabled, skipping setup');
      return;
    }

    console.log('🔍 Setting up message detection for ALL messages...');
    channelRef.current = createChannel();

    return () => {
      console.log('🔕 Cleanup: Unsubscribing from message detection');
      
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      isConnectedRef.current = false;
    };
  }, [isEnabled, onMessageDetected]);

  // Health check effect - reconnect if disconnected for too long
  useEffect(() => {
    if (!isEnabled) return;

    const healthCheckInterval = setInterval(() => {
      if (isEnabled && !isConnectedRef.current && !reconnectTimeoutRef.current) {
        console.log('🏥 Health check: Channel disconnected, attempting reconnection...');
        
        // Clean up current channel
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
        
        // Create new channel
        channelRef.current = createChannel();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isEnabled]);

  return {
    isActive: isEnabled && isConnectedRef.current,
    processedCount: processedMessages.current.size
  };
}
