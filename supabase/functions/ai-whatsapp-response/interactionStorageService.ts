
import { updateLearningModel } from './learningSystem.ts';

export async function storeInteraction(
  supabase: any,
  customerPhone: string,
  customerId: string | null,
  message: string,
  response: string,
  responseTime: number,
  wasFallback: boolean,
  isHomeDeliveryRequest: boolean,
  customerInfo: any
): Promise<string | null> {
  try {
    const { data: interactionData, error: insertError } = await supabase
      .from('ai_chat_interactions')
      .insert({
        customer_id: customerId || null,
        customer_phone: customerPhone,
        user_message: message,
        ai_response: response,
        context_info: {
          customerFound: customerInfo.customerFound,
          packagesCount: customerInfo.packagesCount,
          wasEscalated: false, // NUNCA escalado
          isHomeDeliveryRequest,
          botAlwaysResponds: true,
          escalationDisabled: true
        },
        response_time_ms: responseTime,
        was_fallback: wasFallback
      })
      .select()
      .single();

    if (!insertError && interactionData) {
      await updateLearningModel(supabase, interactionData.id, customerPhone, message, response);
      return interactionData.id;
    }

    if (insertError) {
      console.error('❌ Error storing interaction:', insertError);
    }

    return null;
  } catch (storeError) {
    console.error('❌ Error storing interaction:', storeError);
    return null;
  }
}
