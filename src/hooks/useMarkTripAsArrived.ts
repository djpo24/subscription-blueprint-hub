import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useMarkTripAsArrived() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTripAsArrivedMutation = useMutation({
    mutationFn: async (dispatchId: string) => {
      console.log('🏁 [useMarkTripAsArrived] Iniciando proceso para dispatch:', dispatchId);

      // PASO 1: Verificar que el despacho existe y está en estado "en_transito"
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .select('*')
        .eq('id', dispatchId)
        .single();

      if (dispatchError || !dispatch) {
        console.error('❌ Error: Despacho no encontrado:', dispatchError);
        throw new Error('Despacho no encontrado');
      }

      if (dispatch.status !== 'en_transito') {
        throw new Error('El despacho debe estar en tránsito para marcarlo como llegado');
      }

      console.log('📋 [useMarkTripAsArrived] Despacho encontrado:', dispatch);

      // PASO 2: Obtener SOLO los paquetes de este despacho específico CON información del cliente
      const { data: dispatchPackages, error: packagesError } = await supabase
        .from('dispatch_packages')
        .select(`
          package_id,
          packages!package_id (
            id,
            tracking_number,
            status,
            trip_id,
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
          )
        `)
        .eq('dispatch_id', dispatchId);

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes del despacho:', packagesError);
        throw packagesError;
      }

      if (!dispatchPackages || dispatchPackages.length === 0) {
        throw new Error('No se encontraron paquetes en este despacho');
      }

      const packages = dispatchPackages
        .map(dp => dp.packages)
        .filter(Boolean);

      console.log('📦 [useMarkTripAsArrived] Paquetes del despacho:', packages);

      // PASO 3: Filtrar paquetes que están en tránsito (solo estos deben cambiar)
      const packagesInTransit = packages.filter(pkg => 
        pkg.status === 'transito'
      );

      if (packagesInTransit.length === 0) {
        throw new Error('No hay paquetes en tránsito en este despacho');
      }

      console.log('✅ [useMarkTripAsArrived] Paquetes en tránsito:', packagesInTransit);

      // PASO 4: Actualizar SOLO los paquetes de este despacho a "en_destino"
      const packageIds = packagesInTransit.map(pkg => pkg.id);
      
      const { error: updatePackagesError } = await supabase
        .from('packages')
        .update({
          status: 'en_destino',
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds);

      if (updatePackagesError) {
        console.error('❌ Error actualizando paquetes:', updatePackagesError);
        throw updatePackagesError;
      }

      console.log('✅ [useMarkTripAsArrived] Paquetes actualizados a en_destino');

      // PASO 5: Actualizar SOLO este despacho específico a "llegado"
      const { error: updateDispatchError } = await supabase
        .from('dispatch_relations')
        .update({
          status: 'llegado',
          updated_at: new Date().toISOString()
        })
        .eq('id', dispatchId);

      if (updateDispatchError) {
        console.error('❌ Error actualizando estado del despacho:', updateDispatchError);
        throw updateDispatchError;
      }

      console.log('✅ [useMarkTripAsArrived] Despacho actualizado a llegado');

      // PASO 6: Crear eventos de tracking SOLO para los paquetes de este despacho
      const trackingEvents = packagesInTransit.map(pkg => ({
        package_id: pkg.id,
        event_type: 'arrived',
        description: 'Paquete llegó a destino desde despacho',
        location: 'Destino'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('❌ Error creando tracking events:', trackingError);
        // No lanzar error aquí, es secundario
      }

      // PASO 7: 🆕 CREAR NOTIFICACIONES DE LLEGADA PARA REVISIÓN (NO ENVIAR AUTOMÁTICAMENTE)
      console.log('📱 [useMarkTripAsArrived] Creando notificaciones de llegada para revisión...');
      
      const arrivalNotifications = packagesInTransit
        .filter(pkg => pkg.customers && (pkg.customers.whatsapp_number || pkg.customers.phone))
        .map(pkg => ({
          customer_id: pkg.customer_id,
          package_id: pkg.id,
          notification_type: 'package_arrival',
          message: `Su encomienda ${pkg.tracking_number} ha llegado a ${pkg.destination}`,
          status: 'pending'  // Estado inicial: pendiente de preparación
        }));

      if (arrivalNotifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notification_log')
          .insert(arrivalNotifications);

        if (notificationError) {
          console.error('❌ Error creando notificaciones de llegada:', notificationError);
          // No lanzar error, las notificaciones son secundarias
        } else {
          console.log(`✅ [useMarkTripAsArrived] Creadas ${arrivalNotifications.length} notificaciones pendientes de preparación`);
        }
      }

      // PASO 8: 🚫 NO INVOCAR FUNCIÓN DE PROCESAMIENTO AUTOMÁTICO
      // Las notificaciones ahora requieren revisión manual antes del envío
      console.log('📋 [useMarkTripAsArrived] Notificaciones creadas para revisión manual en la pestaña de notificaciones');

      // PASO 9: Verificar si el trip asociado debe actualizarse a "completed"
      const tripId = packagesInTransit[0]?.trip_id;
      if (tripId) {
        const { data: allTripPackages } = await supabase
          .from('packages')
          .select('status')
          .eq('trip_id', tripId);

        if (allTripPackages) {
          const allPackagesDelivered = allTripPackages.every(pkg => 
            pkg.status === 'delivered' || pkg.status === 'en_destino'
          );

          if (allPackagesDelivered) {
            await supabase
              .from('trips')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('id', tripId);

            console.log('✅ [useMarkTripAsArrived] Trip actualizado a completed');
          }
        }
      }

      console.log('🎉 [useMarkTripAsArrived] Proceso completado exitosamente');
      
      return { 
        updatedPackages: packagesInTransit.length, 
        dispatchId,
        tripId,
        notificationsCreated: arrivalNotifications.length
      };
    },
    onSuccess: (data) => {
      console.log('🎉 [useMarkTripAsArrived] Mutación exitosa, invalidando queries');
      
      // Invalidar todas las queries relevantes
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['package-stats'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      
      // Invalidar por ID específico
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages', data.dispatchId] });
      
      // Refetch inmediato
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages', data.dispatchId] });
      
      toast({
        title: "Despacho marcado como llegado",
        description: `${data.updatedPackages} paquetes actualizados a "En Destino" y ${data.notificationsCreated} notificaciones creadas para revisión`,
      });
    },
    onError: (error: any) => {
      console.error('💥 [useMarkTripAsArrived] Error en mutación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el despacho como llegado",
        variant: "destructive"
      });
    }
  });

  return {
    markTripAsArrived: markTripAsArrivedMutation.mutate,
    isMarkingAsArrived: markTripAsArrivedMutation.isPending,
  };
}
