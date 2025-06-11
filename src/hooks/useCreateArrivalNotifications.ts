
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Creando notificaciones para paquetes en destino...');

      // Obtener todos los paquetes en estado "en_destino" que tengan cliente con teléfono
      const { data: packagesInDestination, error: packagesError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          customer_id,
          destination,
          amount_to_collect,
          currency,
          customers!customer_id (
            id,
            name,
            phone,
            whatsapp_number
          )
        `)
        .eq('status', 'en_destino')
        .not('customer_id', 'is', null);

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes en destino:', packagesError);
        throw packagesError;
      }

      if (!packagesInDestination || packagesInDestination.length === 0) {
        throw new Error('No hay paquetes en estado "En Destino" para procesar');
      }

      console.log(`📦 Encontrados ${packagesInDestination.length} paquetes en destino`);

      // Filtrar paquetes que tienen cliente con teléfono
      const packagesWithPhone = packagesInDestination.filter(pkg => 
        pkg.customers && (pkg.customers.whatsapp_number || pkg.customers.phone)
      );

      if (packagesWithPhone.length === 0) {
        throw new Error('No hay paquetes con información de contacto válida');
      }

      // Verificar cuáles ya tienen notificaciones pendientes o preparadas
      const packageIds = packagesWithPhone.map(pkg => pkg.id);
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
      const packagesToProcess = packagesWithPhone.filter(pkg => 
        !existingPackageIds.has(pkg.id)
      );

      if (packagesToProcess.length === 0) {
        throw new Error('Todos los paquetes ya tienen notificaciones pendientes o preparadas');
      }

      console.log(`📱 Creando notificaciones para ${packagesToProcess.length} paquetes`);

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

      console.log(`✅ Creadas ${arrivalNotifications.length} notificaciones pendientes`);

      return {
        created: arrivalNotifications.length,
        total: packagesInDestination.length,
        skipped: packagesInDestination.length - arrivalNotifications.length
      };
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones creadas exitosamente:', data);
      
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      
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
    createNotifications: notificationsMutation.mutate,
    isCreating: notificationsMutation.isPending,
  };
}
