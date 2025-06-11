
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
    
    console.log(`🔄 NUEVA IMPLEMENTACIÓN: Procesando notificaciones en modo: ${mode} con números DIRECTOS del perfil`)

    if (mode === 'prepare') {
      // MODO PREPARACIÓN: Usar números DIRECTOS del perfil del cliente
      return await prepareArrivalNotificationsWithFreshData(supabaseClient)
    } else if (mode === 'execute') {
      // MODO EJECUCIÓN: Usar números DIRECTOS del perfil del cliente
      return await executeArrivalNotificationsWithFreshData(supabaseClient)
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

async function prepareArrivalNotificationsWithFreshData(supabaseClient: any) {
  console.log('📋 MODO PREPARACIÓN con números DIRECTOS del perfil del cliente...')

  // Obtener notificaciones pendientes SIN datos de clientes (los obtendremos frescos)
  const { data: pendingNotifications, error: fetchError } = await supabaseClient
    .from('notification_log')
    .select(`
      id,
      customer_id,
      package_id,
      notification_type,
      message,
      status,
      created_at,
      packages!notification_log_package_id_fkey (
        tracking_number,
        destination,
        amount_to_collect,
        currency,
        customer_id
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
    console.log('ℹ️ No hay notificaciones pendientes para preparar')
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
    
    throw new Error(`No se encontró dirección específica para "${destination}"`)
  }

  // Función para generar el mensaje con datos FRESCOS del cliente
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
      if (!pkg) {
        console.warn(`⚠️ Paquete no encontrado para notificación ${notification.id}`)
        continue
      }

      // Determinar customer_id (puede venir de la notificación o del paquete)
      const customerId = notification.customer_id || pkg.customer_id
      if (!customerId) {
        console.warn(`⚠️ No se pudo determinar customer_id para notificación ${notification.id}`)
        continue
      }

      // CONSULTA DIRECTA Y FRESCA del perfil del cliente - IGNORAR cualquier dato almacenado
      console.log(`📱 Obteniendo perfil FRESCO del cliente ${customerId} para notificación ${notification.id}...`)
      
      const { data: freshCustomerProfile, error: customerError } = await supabaseClient
        .from('customers')
        .select('id, name, phone, whatsapp_number, updated_at')
        .eq('id', customerId)
        .single()

      if (customerError) {
        console.error(`❌ Error obteniendo perfil FRESCO del cliente ${customerId}:`, customerError)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `Error obteniendo perfil del cliente: ${customerError.message}`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      if (!freshCustomerProfile) {
        console.warn(`⚠️ No se encontró perfil para cliente ${customerId}`)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `No se encontró perfil para cliente ${customerId}`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      // Verificar número de teléfono ACTUAL del perfil
      const currentPhoneNumber = freshCustomerProfile.whatsapp_number || freshCustomerProfile.phone
      
      if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
        console.warn(`⚠️ Cliente ${freshCustomerProfile.name} (${customerId}) NO tiene número de teléfono válido en su perfil`)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `Cliente sin número de teléfono válido en su perfil actual`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      console.log(`✅ PERFIL FRESCO obtenido para notificación ${notification.id}:`)
      console.log(`👤 Cliente: ${freshCustomerProfile.name}`)
      console.log(`📱 Número DIRECTO del perfil: "${currentPhoneNumber}"`)
      console.log(`🕒 Perfil actualizado: ${freshCustomerProfile.updated_at}`)

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

      // Generar el mensaje para revisión con datos FRESCOS
      const messageContent = generateArrivalMessage(
        freshCustomerProfile.name,
        pkg.tracking_number || '',
        destination,
        address,
        pkg.currency || 'COP',
        pkg.amount_to_collect?.toString() || '0'
      )

      console.log(`📝 Preparando notificación ${notification.id} con número DIRECTO: "${currentPhoneNumber}"`)

      // Actualizar la notificación con el mensaje preparado y cambiar status a 'prepared'
      const { error: updateError } = await supabaseClient
        .from('notification_log')
        .update({ 
          message: messageContent,
          status: 'prepared',
          updated_at: new Date().toISOString()
        })
        .eq('id', notification.id)

      if (updateError) {
        console.error(`❌ Error preparando notificación ${notification.id}:`, updateError)
        errorCount++
      } else {
        preparedCount++
        console.log(`✅ Notificación ${notification.id} preparada con número DIRECTO del perfil`)
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

  console.log(`📊 Preparación completada: ${preparedCount} preparadas con números DIRECTOS, ${errorCount} errores`)

  return new Response(
    JSON.stringify({ 
      prepared: preparedCount,
      errors: errorCount,
      total: pendingNotifications.length,
      message: `${preparedCount} notificaciones preparadas con números DIRECTOS del perfil`
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  )
}

async function executeArrivalNotificationsWithFreshData(supabaseClient: any) {
  console.log('🚀 MODO EJECUCIÓN con números DIRECTOS del perfil del cliente...')

  // Obtener notificaciones preparadas SIN datos de clientes (los obtendremos frescos)
  const { data: preparedNotifications, error: fetchError } = await supabaseClient
    .from('notification_log')
    .select(`
      id,
      customer_id,
      package_id,
      notification_type,
      message,
      status,
      created_at,
      packages!notification_log_package_id_fkey (
        tracking_number,
        destination,
        amount_to_collect,
        currency,
        customer_id
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
      
      // Determinar customer_id (puede venir de la notificación o del paquete)
      const customerId = notification.customer_id || pkg?.customer_id
      if (!customerId) {
        console.warn(`⚠️ No se pudo determinar customer_id para notificación ${notification.id}`)
        continue
      }

      // CONSULTA DIRECTA Y FRESCA del perfil del cliente en el momento del envío
      console.log(`📱 Obteniendo perfil FRESCO del cliente ${customerId} para ENVÍO de notificación ${notification.id}...`)
      
      const { data: freshCustomerProfile, error: customerError } = await supabaseClient
        .from('customers')
        .select('id, name, phone, whatsapp_number, updated_at')
        .eq('id', customerId)
        .single()

      if (customerError) {
        console.error(`❌ Error obteniendo perfil FRESCO del cliente ${customerId} para envío:`, customerError)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `Error obteniendo perfil del cliente para envío: ${customerError.message}`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      if (!freshCustomerProfile) {
        console.warn(`⚠️ No se encontró perfil para cliente ${customerId} al momento del envío`)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `No se encontró perfil para cliente ${customerId} al momento del envío`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      // Obtener número de teléfono ACTUAL del perfil en el momento del envío
      const currentPhoneNumber = freshCustomerProfile.whatsapp_number || freshCustomerProfile.phone
      
      if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
        console.warn(`⚠️ Cliente ${freshCustomerProfile.name} (${customerId}) NO tiene número válido en el momento del envío`)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: `Cliente sin número de teléfono válido en su perfil al momento del envío`
          })
          .eq('id', notification.id)
        
        errorCount++
        continue
      }

      console.log(`🚀 ENVIANDO notificación ${notification.id} con datos FRESCOS del perfil:`)
      console.log(`👤 Cliente: ${freshCustomerProfile.name}`)
      console.log(`📱 Número DIRECTO del perfil: "${currentPhoneNumber}"`)
      console.log(`🕒 Perfil actualizado: ${freshCustomerProfile.updated_at}`)

      // Marcar como enviándose
      await supabaseClient
        .from('notification_log')
        .update({ status: 'sending' })
        .eq('id', notification.id)

      // Enviar vía WhatsApp usando el número DIRECTO del perfil
      const { data: responseData, error: functionError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notification.id,
          phone: currentPhoneNumber, // Usar número DIRECTO del perfil
          message: notification.message,
          customerId: customerId,
          useTemplate: true,
          templateName: 'package_arrival_notification',
          templateLanguage: 'es_CO',
          templateParameters: {
            customerName: freshCustomerProfile.name,
            trackingNumber: pkg?.tracking_number || '',
            destination: pkg?.destination || '',
            address: notification.message.match(/dirección: (.+?)\./)?.[1] || '',
            currency: pkg?.currency === 'AWG' ? 'ƒ' : '$',
            amount: pkg?.amount_to_collect?.toString() || '0'
          }
        }
      })

      if (functionError) {
        console.error(`❌ Error enviando notificación ${notification.id} a número DIRECTO "${currentPhoneNumber}":`, functionError)
        
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: functionError.message
          })
          .eq('id', notification.id)
        
        errorCount++
      } else if (responseData?.success) {
        console.log(`✅ Notificación ${notification.id} enviada exitosamente a número DIRECTO "${currentPhoneNumber}"`)
        
        // Registrar el mensaje en sent_messages con el número DIRECTO
        await supabaseClient
          .from('sent_messages')
          .insert({
            customer_id: customerId,
            phone: currentPhoneNumber, // Usar número DIRECTO del perfil
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

  console.log(`📊 Ejecución completada: ${executedCount} enviadas con números DIRECTOS, ${errorCount} errores`)

  return new Response(
    JSON.stringify({ 
      executed: executedCount,
      errors: errorCount,
      total: preparedNotifications.length,
      message: `${executedCount} notificaciones enviadas con números DIRECTOS del perfil`
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  )
}
