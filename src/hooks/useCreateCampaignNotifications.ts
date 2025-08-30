
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateCampaignNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Creando notificaciones de campaña para todos los clientes...');

      // 1. Obtener todos los clientes activos
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number')
        .order('name');

      if (customersError) {
        console.error('❌ Error obteniendo clientes:', customersError);
        throw customersError;
      }

      if (!customers || customers.length === 0) {
        throw new Error('No hay clientes en el sistema para procesar');
      }

      console.log(`👥 Encontrados ${customers.length} clientes`);

      let createdCount = 0;
      let skippedCount = 0;

      // 2. Para cada cliente, crear una notificación de campaña pendiente
      for (const customer of customers) {
        const phoneNumber = customer.whatsapp_number || customer.phone;
        
        if (!phoneNumber || phoneNumber.trim() === '') {
          console.log(`⚠️ Saltando cliente ${customer.name} - sin número de teléfono`);
          skippedCount++;
          continue;
        }

        // Verificar si ya existe una notificación pendiente o preparada para este cliente
        const { data: existingNotification } = await supabase
          .from('trip_notification_log')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('template_name', 'proximos_viajes')
          .in('status', ['pending', 'prepared'])
          .single();

        if (existingNotification) {
          console.log(`⚠️ Cliente ${customer.name} ya tiene una notificación de campaña`);
          skippedCount++;
          continue;
        }

        // Crear notificación de campaña pendiente
        const { error: insertError } = await supabase
          .from('trip_notification_log')
          .insert({
            customer_id: customer.id,
            customer_name: customer.name,
            customer_phone: phoneNumber,
            template_name: 'proximos_viajes',
            template_language: 'es_CO',
            personalized_message: `¡Hola ${customer.name}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`,
            status: 'pending'
          });

        if (insertError) {
          console.error(`❌ Error creando notificación para ${customer.name}:`, insertError);
          skippedCount++;
          continue;
        }

        createdCount++;
        console.log(`✅ Notificación de campaña creada para: ${customer.name}`);
      }

      console.log(`✅ Proceso completado: ${createdCount} creadas, ${skippedCount} saltadas`);

      return {
        created: createdCount,
        skipped: skippedCount,
        total: customers.length
      };
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones de campaña creadas exitosamente:', data);
      
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
      
      toast({
        title: "Notificaciones de Campaña Creadas",
        description: `${data.created} notificaciones creadas para campaña de próximos viajes. ${data.skipped > 0 ? `${data.skipped} clientes saltados.` : ''}`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creando notificaciones de campaña:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron crear las notificaciones de campaña",
        variant: "destructive"
      });
    }
  });

  return {
    createNotifications: createNotificationsMutation.mutate,
    isCreating: createNotificationsMutation.isPending,
  };
}
