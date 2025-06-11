
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useCreateDispatchSimple() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      packageIds, 
      notes 
    }: { 
      packageIds: string[]; 
      notes?: string;
    }) => {
      console.log('🚀 [ESTADO DESPACHADO] === CREANDO DESPACHO Y ACTUALIZANDO ESTADOS ===');
      console.log('📦 [ESTADO DESPACHADO] Paquetes a despachar:', packageIds.length);
      
      if (packageIds.length === 0) {
        throw new Error('No hay paquetes seleccionados');
      }

      // 1. Obtener información de los paquetes
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, weight, freight, amount_to_collect, status, tracking_number')
        .in('id', packageIds);

      if (packagesError) {
        console.error('❌ [ESTADO DESPACHADO] Error obteniendo paquetes:', packagesError);
        throw packagesError;
      }

      console.log('📋 [ESTADO DESPACHADO] Paquetes obtenidos:', packages?.length);
      console.log('📋 [ESTADO DESPACHADO] Estados actuales:', packages?.map(p => `${p.tracking_number}: ${p.status}`));

      // 2. Calcular totales
      const totals = (packages || []).reduce(
        (acc, pkg) => ({
          weight: acc.weight + (pkg.weight || 0),
          freight: acc.freight + (pkg.freight || 0),
          amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
        }),
        { weight: 0, freight: 0, amount_to_collect: 0 }
      );

      console.log('📊 [ESTADO DESPACHADO] Totales calculados:', totals);

      // 3. Crear despacho
      const currentDate = new Date();
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .insert({
          dispatch_date: currentDate.toISOString().split('T')[0],
          notes: notes || null
        })
        .select()
        .single();

      if (dispatchError) {
        console.error('❌ [ESTADO DESPACHADO] Error creando despacho:', dispatchError);
        throw dispatchError;
      }

      console.log('✅ [ESTADO DESPACHADO] Despacho creado:', dispatch.id);

      // 4. Crear relaciones paquete-despacho
      const dispatchPackages = packageIds.map(packageId => ({
        dispatch_id: dispatch.id,
        package_id: packageId
      }));

      const { error: relationError } = await supabase
        .from('dispatch_packages')
        .insert(dispatchPackages);

      if (relationError) {
        console.error('❌ [ESTADO DESPACHADO] Error creando relaciones:', relationError);
        throw relationError;
      }

      console.log('✅ [ESTADO DESPACHADO] Relaciones creadas:', dispatchPackages.length);

      // 5. *** CRÍTICO *** Actualizar estado de paquetes a "despachado"
      console.log('🔄 [ESTADO DESPACHADO] === ACTUALIZANDO ESTADOS A DESPACHADO ===');
      
      const { data: updatedPackages, error: updateError } = await supabase
        .from('packages')
        .update({ 
          status: 'despachado',
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds)
        .select('id, tracking_number, status');

      if (updateError) {
        console.error('❌ [ESTADO DESPACHADO] ERROR CRÍTICO actualizando estados:', updateError);
        throw new Error(`Error actualizando estados de paquetes: ${updateError.message}`);
      }

      console.log('✅ [ESTADO DESPACHADO] Estados actualizados exitosamente:');
      updatedPackages?.forEach(pkg => {
        console.log(`   ✓ ${pkg.tracking_number}: ${pkg.status}`);
      });

      // 6. Crear eventos de tracking
      const trackingEvents = packageIds.map(packageId => ({
        package_id: packageId,
        event_type: 'dispatched',
        description: 'Encomienda despachada',
        location: 'Centro de distribución'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('⚠️ [ESTADO DESPACHADO] Error creando eventos de tracking:', trackingError);
        // No lanzar error para no fallar todo el proceso
      } else {
        console.log('✅ [ESTADO DESPACHADO] Eventos de tracking creados');
      }

      return { 
        dispatch, 
        packageCount: packageIds.length,
        updatedPackages: updatedPackages || []
      };
    },
    onSuccess: (data) => {
      console.log('🎉 [ESTADO DESPACHADO] === DESPACHO COMPLETADO ===');
      console.log('📊 [ESTADO DESPACHADO] Resumen:');
      console.log(`   • Despacho creado: ${data.dispatch.id}`);
      console.log(`   • Paquetes procesados: ${data.packageCount}`);
      console.log(`   • Estados actualizados: ${data.updatedPackages.length}`);
      
      toast({
        title: "Despacho creado exitosamente",
        description: `Se despacharon ${data.packageCount} encomiendas. Todos los estados fueron actualizados a "despachado".`,
      });
      
      // Invalidar todas las queries relevantes para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      // Refetch inmediato para actualización dinámica
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['packages-by-date'] });
      queryClient.refetchQueries({ queryKey: ['packages'] });
    },
    onError: (error) => {
      console.error('❌ [ESTADO DESPACHADO] ERROR GENERAL:', error);
      
      toast({
        title: "Error al crear despacho",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
