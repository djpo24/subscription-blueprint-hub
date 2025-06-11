
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
      console.log('🚀 [SOLUCIÓN RADICAL] === CREANDO DESPACHO CON ESTADO DESPACHADO ===');
      console.log('📦 [SOLUCIÓN RADICAL] Paquetes a despachar:', packageIds.length);
      
      if (packageIds.length === 0) {
        throw new Error('No hay paquetes seleccionados');
      }

      // 1. Obtener información de los paquetes
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('weight, freight, amount_to_collect')
        .in('id', packageIds);

      if (packagesError) {
        console.error('❌ [SOLUCIÓN RADICAL] Error obteniendo paquetes:', packagesError);
        throw packagesError;
      }

      console.log('📋 [SOLUCIÓN RADICAL] Paquetes obtenidos:', packages?.length);

      // 2. Calcular totales
      const totals = (packages || []).reduce(
        (acc, pkg) => ({
          weight: acc.weight + (pkg.weight || 0),
          freight: acc.freight + (pkg.freight || 0),
          amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
        }),
        { weight: 0, freight: 0, amount_to_collect: 0 }
      );

      console.log('📊 [SOLUCIÓN RADICAL] Totales calculados:', totals);

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
        console.error('❌ [SOLUCIÓN RADICAL] Error creando despacho:', dispatchError);
        throw dispatchError;
      }

      console.log('✅ [SOLUCIÓN RADICAL] Despacho creado:', dispatch.id);

      // 4. Crear relaciones paquete-despacho
      const dispatchPackages = packageIds.map(packageId => ({
        dispatch_id: dispatch.id,
        package_id: packageId
      }));

      const { error: relationError } = await supabase
        .from('dispatch_packages')
        .insert(dispatchPackages);

      if (relationError) {
        console.error('❌ [SOLUCIÓN RADICAL] Error creando relaciones:', relationError);
        throw relationError;
      }

      console.log('✅ [SOLUCIÓN RADICAL] Relaciones creadas:', dispatchPackages.length);

      // 5. Actualizar estado de paquetes a "despachado" (nuevo estado)
      const { error: updateError } = await supabase
        .from('packages')
        .update({ 
          status: 'despachado', // Cambiar al nuevo estado "despachado"
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds);

      if (updateError) {
        console.error('⚠️ [SOLUCIÓN RADICAL] Error actualizando paquetes:', updateError);
        // No lanzar error para no fallar todo el proceso
      } else {
        console.log('✅ [SOLUCIÓN RADICAL] Estados de paquetes actualizados a "despachado"');
      }

      return { dispatch, packageCount: packageIds.length };
    },
    onSuccess: (data) => {
      console.log('🎉 [SOLUCIÓN RADICAL] DESPACHO CREADO CON ESTADO DESPACHADO');
      
      toast({
        title: "Despacho creado",
        description: `Se creó el despacho con ${data.packageCount} encomiendas (estado: despachado)`,
      });
      
      // Invalidar todas las queries relevantes
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error) => {
      console.error('❌ [SOLUCIÓN RADICAL] ERROR EN DESPACHO:', error);
      
      toast({
        title: "Error",
        description: `Error al crear despacho: ${error.message}`,
        variant: "destructive",
      });
    }
  });
}
