import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useReloadArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (dispatchId: string) => {
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .select('id, status')
        .eq('id', dispatchId)
        .single();

      if (dispatchError || !dispatch) {
        throw new Error('Despacho no encontrado');
      }

      if (dispatch.status !== 'llegado') {
        throw new Error('El despacho debe estar en estado "llegado"');
      }

      const { data: dispatchPackages, error: packagesError } = await supabase
        .from('dispatch_packages')
        .select(`
          package_id,
          packages!package_id (
            id,
            tracking_number,
            destination,
            customer_id,
            customers!customer_id (
              id,
              phone,
              whatsapp_number
            )
          )
        `)
        .eq('dispatch_id', dispatchId);

      if (packagesError) throw packagesError;

      const packages = (dispatchPackages || [])
        .map(dp => dp.packages)
        .filter(Boolean) as Array<{
          id: string;
          tracking_number: string;
          destination: string;
          customer_id: string;
          customers: { id: string; phone: string | null; whatsapp_number: string | null } | null;
        }>;

      const eligiblePackages = packages.filter(
        pkg => pkg.customers && (pkg.customers.whatsapp_number || pkg.customers.phone)
      );

      if (eligiblePackages.length === 0) {
        return { created: 0, skipped: 0 };
      }

      const packageIds = eligiblePackages.map(pkg => pkg.id);

      const { data: existingNotifications, error: existingError } = await supabase
        .from('notification_log')
        .select('package_id')
        .eq('notification_type', 'package_arrival')
        .in('package_id', packageIds);

      if (existingError) throw existingError;

      const existingPackageIds = new Set((existingNotifications || []).map(n => n.package_id));
      const packagesNeedingNotification = eligiblePackages.filter(
        pkg => !existingPackageIds.has(pkg.id)
      );

      if (packagesNeedingNotification.length === 0) {
        return { created: 0, skipped: eligiblePackages.length };
      }

      const arrivalNotifications = packagesNeedingNotification.map(pkg => ({
        customer_id: pkg.customer_id,
        package_id: pkg.id,
        notification_type: 'package_arrival',
        message: `Su encomienda ${pkg.tracking_number} ha llegado a ${pkg.destination}`,
        status: 'pending',
      }));

      const { error: insertError } = await supabase
        .from('notification_log')
        .insert(arrivalNotifications);

      if (insertError) throw insertError;

      return {
        created: packagesNeedingNotification.length,
        skipped: existingPackageIds.size,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.refetchQueries({ queryKey: ['notification-log'] });

      if (data.created === 0 && data.skipped > 0) {
        toast({
          title: 'Notificaciones ya estaban cargadas',
          description: `${data.skipped} paquetes ya tenían su notificación de llegada`,
        });
      } else {
        toast({
          title: 'Notificaciones recargadas',
          description: `${data.created} notificaciones creadas${data.skipped > 0 ? `, ${data.skipped} ya existían` : ''}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron recargar las notificaciones',
        variant: 'destructive',
      });
    },
  });

  return {
    reloadArrivalNotifications: mutation.mutate,
    isReloadingNotifications: mutation.isPending,
  };
}
