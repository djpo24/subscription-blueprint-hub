import type { ChatMessage, ProcessedMessage, ReactionData } from '@/types/chatMessage';

export function processMessagesWithReactionsAndReplies(messages: ChatMessage[]): ProcessedMessage[] {
  // Create a map to store reactions by message ID
  const reactionsByMessageId = new Map<string, Array<{emoji: string; users: string[]}>>();
  
  // First pass: collect all reactions
  messages.forEach(message => {
    if (message.message_type === 'reaction' && message.raw_data?.reaction_details) {
      const reactionData: ReactionData = message.raw_data.reaction_details;
      const targetMessageId = reactionData.message_id;
      
      if (targetMessageId) {
        if (!reactionsByMessageId.has(targetMessageId)) {
          reactionsByMessageId.set(targetMessageId, []);
        }
        
        const reactions = reactionsByMessageId.get(targetMessageId)!;
        const existingReaction = reactions.find(r => r.emoji === reactionData.emoji);
        
        if (existingReaction) {
          // Add user to existing reaction (in a real app, you'd track actual users)
          existingReaction.users.push(message.from_phone || 'Usuario');
        } else {
          // Add new reaction
          reactions.push({
            emoji: reactionData.emoji,
            users: [message.from_phone || 'Usuario']
          });
        }
      }
    }
  });
  
  // Second pass: process messages and add reactions/replies
  const processedMessages: ProcessedMessage[] = [];
  
  messages.forEach(message => {
    // Skip standalone reaction messages (they're now integrated into original messages)
    if (message.message_type === 'reaction') {
      return;
    }
    
    const processedMessage: ProcessedMessage = { ...message };
    
    // Add reactions if this message has any
    if (message.whatsapp_message_id && reactionsByMessageId.has(message.whatsapp_message_id)) {
      const reactions = reactionsByMessageId.get(message.whatsapp_message_id)!;
      processedMessage.reactions = reactions.map(r => ({
        emoji: r.emoji,
        count: r.users.length,
        users: r.users
      }));
    }
    
    // Check if this is a reply to another message
    // Note: WhatsApp API doesn't always provide reply context in webhook,
    // but we can detect patterns in message content or use context.message_id if available
    const replyContext = message.raw_data?.context?.quoted || message.raw_data?.context;
    if (replyContext?.id) {
      const referencedMessage = messages.find(msg => msg.whatsapp_message_id === replyContext.id);
      if (referencedMessage) {
        processedMessage.isReply = true;
        processedMessage.referencedMessage = referencedMessage;
        processedMessage.reply_to_message_id = replyContext.id;
      }
    }
    
    processedMessages.push(processedMessage);
  });
  
  return processedMessages;
}