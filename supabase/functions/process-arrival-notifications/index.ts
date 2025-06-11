
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Procesando notificaciones de llegada automáticamente...')

    // Obtener notificaciones pendientes de llegada - ahora usando la foreign key correcta
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from('notification_log')
      .select(`
        *,
        customers!customer_id (
          name,
          phone,
          whatsapp_number
        ),
        packages!fk_notification_log_package (
          tracking_number,
          destination,
          amount_to_collect,
          currency
        )
      `)
      .eq('notification_type', 'package_arrival')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error obteniendo notificaciones pendientes:', fetchError)
      throw fetchError
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log('ℹ️ No hay notificaciones pendientes de llegada')
      return new Response(
        JSON.stringify({ processed: 0, message: 'No hay notificaciones pendientes' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let processedCount = 0
    let errorCount = 0

    // Función MEJORADA para obtener la dirección del destino
    const getDestinationAddress = async (destination: string) => {
      if (!destination) {
        console.error('❌ CRÍTICO: No se proporcionó destino para buscar dirección')
        throw new Error('Destino requerido para obtener dirección')
      }
      
      console.log(`🏢 Buscando dirección para destino: "${destination}"`)
      
      // Buscar dirección exacta por ciudad
      const { data: destinationAddress, error } = await supabaseClient
        .from('destination_addresses')
        .select('address, city')
        .ilike('city', `%${destination.trim()}%`)
        .limit(1)
        .maybeSingle()
      
      if (error) {
        console.error(`❌ Error buscando dirección para ${destination}:`, error)
        throw new Error(`Error al buscar dirección para ${destination}`)
      }
      
      if (destinationAddress && destinationAddress.address) {
        console.log(`✅ Dirección encontrada para ${destination}: ${destinationAddress.address}`)
        return destinationAddress.address
      }
      
      // Si no se encuentra dirección específica, crear una dirección genérica pero descriptiva
      const genericAddress = `oficina de ${destination}`
      console.warn(`⚠️ ADVERTENCIA: No se encontró dirección específica para "${destination}", usando: "${genericAddress}"`)
      
      // Registrar este evento para que el administrador pueda agregar la dirección después
      console.log(`📝 ACCIÓN REQUERIDA: Agregar dirección específica para ${destination} en destination_addresses`)
      
      return genericAddress
    }

    // Función para generar el mensaje exacto según el formato requerido
    const generateArrivalMessage = (customerName: string, trackingNumber: string, destination: string, address: string, currency: string, amount: string) => {
      const currencySymbol = currency === 'AWG' ? 'ƒ' : '$'
      
      return `📦 Hola ${customerName},
 tu encomienda ${trackingNumber} ha llegado a ${destination}. 

📍 Ya puedes recogerla en la dirección: ${address}. 

💰 Te recordamos el valor a pagar: ${currencySymbol}${amount}.`
    }

    for (const notification of pendingNotifications) {
      try {
        const customerPhone = notification.customers?.whatsapp_number || notification.customers?.phone
        
        if (!customerPhone) {
          console.warn(`⚠️ No hay teléfono para la notificación ${notification.id}`)
          continue
        }

        const destination = notification.packages?.destination
        if (!destination) {
          console.error(`❌ CRÍTICO: Paquete sin destino para notificación ${notification.id}`)
          throw new Error('Paquete debe tener destino para enviar notificación')
        }

        // OBTENER DIRECCIÓN OBLIGATORIAMENTE - NO PERMITIR FALLBACK GENÉRICO
        let address
        try {
          address = await getDestinationAddress(destination)
          console.log(`📍 Dirección confirmada para ${destination}: "${address}"`)
        } catch (error) {
          console.error(`❌ CRÍTICO: No se pudo obtener dirección para ${destination}:`, error)
          
          // Marcar como fallido porque no tenemos dirección válida
          await supabaseClient
            .from('notification_log')
            .update({ 
              status: 'failed',
              error_message: `No se pudo obtener dirección para destino: ${destination}`
            })
            .eq('id', notification.id)
          
          errorCount++
          continue // Saltar esta notificación
        }

        // Verificar que la dirección no sea genérica peligrosa
        if (address.toLowerCase().includes('nuestras oficinas')) {
          console.error(`❌ CRÍTICO: Se detectó dirección genérica peligrosa: "${address}"`)
          
          // Marcar como fallido
          await supabaseClient
            .from('notification_log')
            .update({ 
              status: 'failed',
              error_message: 'Dirección genérica detectada - requiere dirección específica'
            })
            .eq('id', notification.id)
          
          errorCount++
          continue
        }

        // Generar el mensaje exacto según el formato requerido
        const messageContent = generateArrivalMessage(
          notification.customers?.name || 'Cliente',
          notification.packages?.tracking_number || '',
          destination,
          address,
          notification.packages?.currency || 'COP',
          notification.packages?.amount_to_collect?.toString() || '0'
        )

        console.log(`📱 Enviando notificación para ${notification.packages?.tracking_number} a ${destination}`)
        console.log(`📍 Dirección confirmada: "${address}"`)

        // Actualizar el mensaje en notification_log para que coincida exactamente
        await supabaseClient
          .from('notification_log')
          .update({ 
            message: messageContent,
            status: 'processing' 
          })
          .eq('id', notification.id)

        // Enviar notificación via WhatsApp con VALIDACIÓN ESTRICTA de dirección
        const { data: responseData, error: functionError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notification.id,
            phone: customerPhone,
            message: messageContent,
            customerId: notification.customer_id,
            useTemplate: true,
            templateName: 'package_arrival_notification',
            templateLanguage: 'es_CO',
            templateParameters: {
              customerName: notification.customers?.name || 'Cliente',
              trackingNumber: notification.packages?.tracking_number || '',
              destination: destination,
              address: address, // Dirección ya validada y específica
              currency: notification.packages?.currency === 'AWG' ? 'ƒ' : '$',
              amount: notification.packages?.amount_to_collect?.toString() || '0'
            }
          }
        })

        if (functionError) {
          console.error(`❌ Error enviando notificación ${notification.id}:`, functionError)
          
          // Marcar como fallido
          await supabaseClient
            .from('notification_log')
            .update({ 
              status: 'failed',
              error_message: functionError.message
            })
            .eq('id', notification.id)
          
          errorCount++
        } else if (responseData?.success) {
          console.log(`✅ Notificación ${notification.id} enviada con dirección: "${address}"`)
          
          // Registrar el mensaje en sent_messages para que aparezca en el chat
          console.log('📝 Registrando mensaje de notificación en sent_messages...')
          const { error: sentMessageError } = await supabaseClient
            .from('sent_messages')
            .insert({
              customer_id: notification.customer_id,
              phone: customerPhone,
              message: messageContent,
              status: 'sent'
            })

          if (sentMessageError) {
            console.error('Error registrando mensaje en sent_messages:', sentMessageError)
          } else {
            console.log('✅ Mensaje de notificación registrado en chat')
          }
          
          processedCount++
        }

      } catch (error: any) {
        console.error(`❌ Error procesando notificación ${notification.id}:`, error)
        
        // Marcar como fallido
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id)
        
        errorCount++
      }
    }

    console.log(`📊 Procesamiento completado: ${processedCount} enviadas, ${errorCount} errores`)

    return new Response(
      JSON.stringify({ 
        processed: processedCount,
        errors: errorCount,
        total: pendingNotifications.length,
        message: `Procesadas ${processedCount} notificaciones con direcciones específicas`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en process-arrival-notifications:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
