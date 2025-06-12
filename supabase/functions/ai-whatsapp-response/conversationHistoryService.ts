
export async function getSecureConversationHistory(supabase: any, customerPhone: string, customerId?: string) {
  try {
    // 🔒 ONLY get messages for this specific customer phone number - increased limit
    const { data: incomingMessages, error: incomingError } = await supabase
      .from('incoming_messages')
      .select('message_content, timestamp')
      .eq('from_phone', customerPhone) // Strict filter by phone
      .order('timestamp', { ascending: false })
      .limit(50); // Increased limit to 50

    if (incomingError) {
      console.error('Error fetching incoming messages for this customer:', incomingError);
    }

    // 🔒 ONLY get sent messages for this specific customer phone number - increased limit
    const { data: sentMessages, error: sentError } = await supabase
      .from('sent_messages')
      .select('message, sent_at')
      .eq('phone', customerPhone) // Strict filter by phone
      .order('sent_at', { ascending: false })
      .limit(50); // Increased limit to 50

    if (sentError) {
      console.error('Error fetching sent messages for this customer:', sentError);
    }

    // Combine and sort by timestamp - all messages are already filtered by customer phone
    const allMessages: Array<{
      message: string;
      isFromCustomer: boolean;
      timestamp: string;
    }> = [];

    if (incomingMessages) {
      incomingMessages.forEach(msg => {
        if (msg.message_content) {
          allMessages.push({
            message: msg.message_content,
            isFromCustomer: true,
            timestamp: msg.timestamp
          });
        }
      });
    }

    if (sentMessages) {
      sentMessages.forEach(msg => {
        if (msg.message) {
          allMessages.push({
            message: msg.message,
            isFromCustomer: false,
            timestamp: msg.sent_at
          });
        }
      });
    }

    // Sort by timestamp (most recent first) and return last 20 messages for THIS customer only
    const customerMessages = allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20) // Increased from 8 to 20 messages
      .reverse(); // Reverse to get chronological order for context

    console.log(`🔐 Retrieved ${customerMessages.length} secure messages for customer phone: ${customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`);
    
    return customerMessages;

  } catch (error) {
    console.error('Error building secure conversation context:', error);
    return [];
  }
}
