
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 NUEVA IMPLEMENTACIÓN: Creando notificaciones con números DIRECTOS del perfil del cliente...');

      // 1. Obtener paquetes en estado "en_destino" SIN datos de clientes
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

      // 2. Para CADA paquete, obtener datos FRESCOS Y DIRECTOS del perfil del cliente
      const packagesWithFreshCustomerData = await Promise.all(
        packagesInDestination.map(async (pkg) => {
          console.log(`📱 Consultando perfil DIRECTO del cliente ${pkg.customer_id} para paquete ${pkg.tracking_number}...`);
          
          // CONSULTA DIRECTA del perfil del cliente - IGNORANDO cualquier dato almacenado
          const { data: freshCustomerProfile, error: customerError } = await supabase
            .from('customers')
            .select('id, name, phone, whatsapp_number, updated_at')
            .eq('id', pkg.customer_id)
            .single();

          if (customerError) {
            console.error(`❌ Error obteniendo perfil FRESCO del cliente ${pkg.customer_id}:`, customerError);
            return null;
          }

          if (!freshCustomerProfile) {
            console.warn(`⚠️ No se encontró perfil para cliente ${pkg.customer_id} del paquete ${pkg.tracking_number}`);
            return null;
          }

          // Verificar teléfono ACTUAL del perfil
          const currentPhoneNumber = freshCustomerProfile.whatsapp_number || freshCustomerProfile.phone;
          
          if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
            console.warn(`⚠️ Cliente ${freshCustomerProfile.name} (${pkg.customer_id}) NO tiene teléfono válido en su perfil actual`);
            return null;
          }

          console.log(`✅ PERFIL FRESCO obtenido para paquete ${pkg.tracking_number}:`);
          console.log(`👤 Cliente: ${freshCustomerProfile.name}`);
          console.log(`📱 Número DIRECTO del perfil: "${currentPhoneNumber}"`);
          console.log(`🕒 Perfil actualizado: ${freshCustomerProfile.updated_at}`);

          return {
            ...pkg,
            customers: freshCustomerProfile
          };
        })
      );

      // Filtrar paquetes válidos con perfiles frescos
      const validPackages = packagesWithFreshCustomerData.filter(Boolean);

      if (validPackages.length === 0) {
        throw new Error('No hay paquetes con perfiles de clientes válidos y números de teléfono actuales');
      }

      console.log(`📱 Paquetes con perfiles FRESCOS y teléfonos válidos: ${validPackages.length}`);

      // 3. Verificar cuáles ya tienen notificaciones pendientes o preparadas
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

      console.log(`📱 Creando notificaciones para ${packagesToProcess.length} paquetes con números DIRECTOS del perfil`);

      // 4. Crear notificaciones de llegada para revisión
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

      console.log(`✅ Creadas ${arrivalNotifications.length} notificaciones pendientes que usarán números DIRECTOS del perfil`);

      // Log de verificación
      packagesToProcess.forEach(pkg => {
        const phone = pkg.customers.whatsapp_number || pkg.customers.phone;
        console.log(`📋 Paquete ${pkg.tracking_number} - Cliente: ${pkg.customers.name} - Teléfono DIRECTO: "${phone}"`);
      });

      return {
        created: arrivalNotifications.length,
        total: packagesInDestination.length,
        skipped: packagesInDestination.length - arrivalNotifications.length,
        withValidPhone: validPackages.length
      };
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones creadas exitosamente con perfiles FRESCOS:', data);
      
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      toast({
        title: "Notificaciones Creadas",
        description: `${data.created} notificaciones creadas que usarán números DIRECTOS del perfil del cliente. ${data.skipped > 0 ? `${data.skipped} ya tenían notificaciones.` : ''}`,
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
