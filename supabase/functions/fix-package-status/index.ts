import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { trackingNumber } = await req.json()

    console.log('🔧 Corrigiendo estado del paquete:', trackingNumber)

    // Obtener el paquete
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single()

    if (pkgError || !pkg) {
      throw new Error('Paquete no encontrado')
    }

    console.log('📦 Paquete actual:', {
      tracking: pkg.tracking_number,
      status: pkg.status,
      trip_id: pkg.trip_id
    })

    // Actualizar estado a "recibido"
    const { error: updateError } = await supabase
      .from('packages')
      .update({
        status: 'recibido',
        updated_at: new Date().toISOString()
      })
      .eq('id', pkg.id)

    if (updateError) {
      throw updateError
    }

    // Crear evento de tracking
    await supabase
      .from('tracking_events')
      .insert({
        package_id: pkg.id,
        event_type: 'status_correction',
        description: `Estado corregido de "${pkg.status}" a "recibido" - El paquete fue creado incorrectamente sin cumplir protocolos`,
        location: 'Sistema'
      })

    console.log('✅ Paquete corregido exitosamente')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Paquete corregido exitosamente',
        package: {
          tracking_number: pkg.tracking_number,
          old_status: pkg.status,
          new_status: 'recibido'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
