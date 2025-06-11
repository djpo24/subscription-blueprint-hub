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

    const { mode = 'prepare' } = await req.json().catch(() => ({}))
    
    console.log(`🔄 Procesando notificaciones de llegada en modo: ${mode}`)

    if (mode === 'prepare') {
      // MODO PREPARACIÓN: Solo crear notificaciones para revisión (NO enviar)
      return await prepareArrivalNotifications(supabaseClient)
    } else if (mode === 'execute') {
      // MODO EJECUCIÓN: Enviar notificaciones pendientes ya revisadas
      return await executeArrivalNotifications(supabaseClient)
    } else {
      throw new Error('Modo no válido. Use "prepare" o "execute"')
    }

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

async function prepareArrivalNotifications(supabaseClient: any) {
  console.log('📋 MODO PREPARACIÓN: Creando notificaciones para revisión...')

  // Obtener notificaciones pendientes de llegada que AÚN NO han sido preparadas
  const { data: pendingNotifications, error: fetchError } = await supabaseClient
    .from('notification_log')
    .select(`
      *,
      packages!notification_log_package_id_fkey (
        tracking_number,
        destination,
        amount_to_collect,
        currency,
        customer_id,
        customers!customer_id (
          id,
          name,
          phone,
          whatsapp_number
        )
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
    console.log('ℹ️ No hay notificaciones pendientes de llegada para preparar')
    return new Response(
      JSON.stringify({ prepared: 0, message: 'No hay notificaciones pendientes para preparar' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }

  let preparedCount = 0
  let errorCount = 0

  // Función para obtener la dirección del destino
  const getDestinationAddress = async (destination: string) => {
    if (!destination) {
      throw new Error('Destino requerido para obtener dirección')
    }
    
    console.log(`🏢 Buscando dirección para destino: "${destination}"`)
    
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
    
    // Si no se encuentra dirección específica, marcar como error
    throw new Error(`No se encontró dirección específica para "${destination}"`)
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
      const pkg = notification.packages
      if (!pkg || !pkg.customers) {
        console.warn(`⚠️ Paquete o cliente no encontrado para notificación ${notification.id}`)
        continue
      }

      const customer = pkg.customers
      const customerPhone = customer.whatsapp_number || customer.phone
      
      if (!customerPhone) {
        console.warn(`⚠️ No hay teléfono para el cliente ${customer.id}`)
        continue
      }

      const destination = pkg.destination
      if (!destination) {
        console.error(`❌ Paquete sin destino para notificación ${notification.id}`)
        continue
      }

      // Obtener dirección (requerida)
      let address
      try {
        address = await getDestinationAddress(destination)
      } catch (error) {
        console.error(`❌ No se pudo obtener dirección para ${destination}:`, error)
        
        // Marcar como fallido por falta de dirección
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `No se pudo obtener dirección para destino: ${destination}`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      // Generar el mensaje para revisión
      const messageContent = generateArrivalMessage(
        customer.name || 'Cliente',
        pkg.tracking_number || '',
        destination,
        address,
        pkg.currency || 'COP',
        pkg.amount_to_collect?.toString() || '0'
      )

      console.log(`📝 Preparando notificación para revisión: ${pkg.tracking_number}`)

      // Actualizar la notificación con el mensaje preparado y cambiar status a 'prepared'
      const { error: updateError } = await supabaseClient
        .from('notification_log')
        .update({ 
          message: messageContent,
          status: 'prepared',  // Nuevo estado: preparado para revisión
          updated_at: new Date().toISOString()
        })
        .eq('id', notification.id)

      if (updateError) {
        console.error(`❌ Error preparando notificación ${notification.id}:`, updateError)
        errorCount++
      } else {
        preparedCount++
        console.log(`✅ Notificación ${notification.id} preparada para revisión`)
      }

    } catch (error: any) {
      console.error(`❌ Error procesando notificación ${notification.id}:`, error)
      
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

  console.log(`📊 Preparación completada: ${preparedCount} preparadas, ${errorCount} errores`)

  return new Response(
    JSON.stringify({ 
      prepared: preparedCount,
      errors: errorCount,
      total: pendingNotifications.length,
      message: `${preparedCount} notificaciones preparadas para revisión`
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  )
}

async function executeArrivalNotifications(supabaseClient: any) {
  console.log('🚀 MODO EJECUCIÓN: Enviando notificaciones preparadas...')

  // Obtener notificaciones preparadas para envío
  const { data: preparedNotifications, error: fetchError } = await supabaseClient
    .from('notification_log')
    .select(`
      *,
      packages!notification_log_package_id_fkey (
        tracking_number,
        destination,
        amount_to_collect,
        currency,
        customer_id,
        customers!customer_id (
          id,
          name,
          phone,
          whatsapp_number
        )
      )
    `)
    .eq('notification_type', 'package_arrival')
    .eq('status', 'prepared')
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('Error obteniendo notificaciones preparadas:', fetchError)
    throw fetchError
  }

  if (!preparedNotifications || preparedNotifications.length === 0) {
    console.log('ℹ️ No hay notificaciones preparadas para enviar')
    return new Response(
      JSON.stringify({ executed: 0, message: 'No hay notificaciones preparadas para enviar' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }

  let executedCount = 0
  let errorCount = 0

  for (const notification of preparedNotifications) {
    try {
      const pkg = notification.packages
      const customer = pkg?.customers
      
      if (!customer) {
        console.warn(`⚠️ Cliente no encontrado para notificación ${notification.id}`)
        continue
      }

      const customerPhone = customer.whatsapp_number || customer.phone
      
      if (!customerPhone) {
        console.warn(`⚠️ No hay teléfono para el cliente ${customer.id}`)
        continue
      }

      console.log(`📱 Enviando notificación ${notification.id} a ${customerPhone}`)

      // Marcar como enviándose
      await supabaseClient
        .from('notification_log')
        .update({ status: 'sending' })
        .eq('id', notification.id)

      // Enviar vía WhatsApp
      const { data: responseData, error: functionError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notification.id,
          phone: customerPhone,
          message: notification.message,
          customerId: customer.id,
          useTemplate: true,
          templateName: 'package_arrival_notification',
          templateLanguage: 'es_CO',
          templateParameters: {
            customerName: customer.name || 'Cliente',
            trackingNumber: pkg?.tracking_number || '',
            destination: pkg?.destination || '',
            address: notification.message.match(/dirección: (.+?)\./)?.[1] || '',
            currency: pkg?.currency === 'AWG' ? 'ƒ' : '$',
            amount: pkg?.amount_to_collect?.toString() || '0'
          }
        }
      })

      if (functionError) {
        console.error(`❌ Error enviando notificación ${notification.id}:`, functionError)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: functionError.message
          })
          .eq('id', notification.id)
        
        errorCount++
      } else if (responseData?.success) {
        console.log(`✅ Notificación ${notification.id} enviada exitosamente`)
        
        // Registrar el mensaje en sent_messages
        await supabaseClient
          .from('sent_messages')
          .insert({
            customer_id: customer.id,
            phone: customerPhone,
            message: notification.message,
            status: 'sent'
          })
        
        executedCount++
      }

    } catch (error: any) {
      console.error(`❌ Error ejecutando notificación ${notification.id}:`, error)
      
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

  console.log(`📊 Ejecución completada: ${executedCount} enviadas, ${errorCount} errores`)

  return new Response(
    JSON.stringify({ 
      executed: executedCount,
      errors: errorCount,
      total: preparedNotifications.length,
      message: `${executedCount} notificaciones enviadas exitosamente`
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  )
}
