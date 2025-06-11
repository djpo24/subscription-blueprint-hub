
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Creando notificaciones para paquetes en destino con datos FRESCOS de cliente...');

      // Obtener todos los paquetes en estado "en_destino"
      const { data: packagesInDestination, error: packagesError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          customer_id,
          destination,
          amount_to_collect,
          currency,
          updated_at
        `)
        .eq('status', 'en_destino')
        .not('customer_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes en destino:', packagesError);
        throw packagesError;
      }

      if (!packagesInDestination || packagesInDestination.length === 0) {
        throw new Error('No hay paquetes en estado "En Destino" para procesar');
      }

      console.log(`📦 Encontrados ${packagesInDestination.length} paquetes en destino`);

      // Para cada paquete, obtener datos FRESCOS del cliente
      const packagesWithFreshCustomerData = await Promise.all(
        packagesInDestination.map(async (pkg) => {
          // Consulta FRESCA de los datos del cliente
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id, name, phone, whatsapp_number, updated_at')
            .eq('id', pkg.customer_id)
            .single();

          if (customerError) {
            console.error(`❌ Error obteniendo datos frescos del cliente ${pkg.customer_id}:`, customerError);
            return null;
          }

          if (!customerData) {
            console.warn(`⚠️ No se encontró cliente para paquete ${pkg.tracking_number}`);
            return null;
          }

          // Verificar teléfono válido con datos FRESCOS
          const hasValidPhone = (customerData.whatsapp_number && customerData.whatsapp_number.trim() !== '') ||
                               (customerData.phone && customerData.phone.trim() !== '');

          if (!hasValidPhone) {
            console.warn(`⚠️ Cliente ${customerData.name} sin teléfono válido para paquete ${pkg.tracking_number}`);
            return null;
          }

          console.log(`📱 Cliente ${customerData.name} - Teléfono FRESCO: ${customerData.whatsapp_number || customerData.phone} (Actualizado: ${customerData.updated_at})`);

          return {
            ...pkg,
            customers: customerData
          };
        })
      );

      // Filtrar paquetes válidos
      const validPackages = packagesWithFreshCustomerData.filter(Boolean);

      if (validPackages.length === 0) {
        throw new Error('No hay paquetes con información de contacto válida');
      }

      console.log(`📱 Paquetes con teléfono válido y datos frescos: ${validPackages.length}`);

      // Verificar cuáles ya tienen notificaciones pendientes o preparadas
      const packageIds = validPackages.map(pkg => pkg.id);
      const { data: existingNotifications } = await supabase
        .from('notification_log')
        .select('package_id')
        .in('package_id', packageIds)
        .eq('notification_type', 'package_arrival')
        .in('status', ['pending', 'prepared']);

      const existingPackageIds = new Set(
        existingNotifications?.map(n => n.package_id) || []
      );

      // Filtrar paquetes que no tienen notificaciones pendientes/preparadas
      const packagesToProcess = validPackages.filter(pkg => 
        !existingPackageIds.has(pkg.id)
      );

      if (packagesToProcess.length === 0) {
        throw new Error('Todos los paquetes ya tienen notificaciones pendientes o preparadas');
      }

      console.log(`📱 Creando notificaciones para ${packagesToProcess.length} paquetes con datos frescos`);

      // Crear notificaciones de llegada para revisión
      const arrivalNotifications = packagesToProcess.map(pkg => ({
        customer_id: pkg.customer_id,
        package_id: pkg.id,
        notification_type: 'package_arrival',
        message: `Su encomienda ${pkg.tracking_number} ha llegado a ${pkg.destination}`,
        status: 'pending'
      }));

      const { error: notificationError } = await supabase
        .from('notification_log')
        .insert(arrivalNotifications);

      if (notificationError) {
        console.error('❌ Error creando notificaciones:', notificationError);
        throw notificationError;
      }

      console.log(`✅ Creadas ${arrivalNotifications.length} notificaciones pendientes con datos frescos de cliente`);

      return {
        created: arrivalNotifications.length,
        total: packagesInDestination.length,
        skipped: packagesInDestination.length - arrivalNotifications.length,
        withValidPhone: validPackages.length
      };
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones creadas exitosamente con datos frescos:', data);
      
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      toast({
        title: "Notificaciones Creadas",
        description: `${data.created} notificaciones creadas para paquetes en destino. ${data.skipped > 0 ? `${data.skipped} ya tenían notificaciones.` : ''}`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creando notificaciones:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron crear las notificaciones",
        variant: "destructive"
      });
    }
  });

  return {
    createNotifications: createNotificationsMutation.mutate,
    isCreating: createNotificationsMutation.isPending,
  };
}
