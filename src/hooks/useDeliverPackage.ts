
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryService } from '@/services/deliveryService';
import { DeliveryFallbackService } from '@/services/deliveryFallbackService';
import { DeliveryErrorHandler } from '@/utils/deliveryErrorHandler';
import { DeliverySuccessHandler } from '@/utils/deliverySuccessHandler';

interface DeliveryPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}

interface DeliverPackageParams {
  packageId: string;
  deliveredBy: string;
  payments?: DeliveryPayment[];
}

export function useDeliverPackage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: DeliverPackageParams) => {
      console.log('🎯 [useDeliverPackage] Iniciando proceso de entrega:', params);
      
      // Validaciones iniciales
      if (!params.packageId) {
        throw new Error('ID del paquete es requerido');
      }
      if (!params.deliveredBy) {
        throw new Error('Información del entregador es requerida');
      }
      
      try {
        console.log('🚀 [useDeliverPackage] Intentando método principal...');
        const result = await DeliveryService.deliverPackage(params);
        console.log('✅ [useDeliverPackage] Método principal exitoso:', result);
        return result;
      } catch (error) {
        console.log('❌ [useDeliverPackage] Error en método principal:', error);
        
        // Analizar el error y decidir si usar fallback
        const { shouldTryFallback } = DeliveryErrorHandler.handleDeliveryError(error);
        
        if (shouldTryFallback || DeliveryErrorHandler.isPermissionError(error)) {
          console.log('🔄 [useDeliverPackage] Intentando método alternativo...');
          try {
            const fallbackResult = await DeliveryFallbackService.deliverPackageWithFallback(params);
            console.log('✅ [useDeliverPackage] Método alternativo exitoso:', fallbackResult);
            return fallbackResult;
          } catch (fallbackError) {
            console.error('❌ [useDeliverPackage] Error en método alternativo:', fallbackError);
            DeliveryErrorHandler.handleDeliveryError(fallbackError);
            throw fallbackError;
          }
        } else {
          console.log('🚫 [useDeliverPackage] No se intentará método alternativo');
          throw error;
        }
      }
    },
    onSuccess: (data, variables) => {
      console.log('🎉 [useDeliverPackage] Entrega exitosa:', { data, variables });
      DeliverySuccessHandler.handleDeliverySuccess(queryClient, variables.deliveredBy);
    },
    onError: (error: any) => {
      console.error('💥 [useDeliverPackage] Error final en entrega:', error);
      // El error ya fue manejado, aquí solo loggeamos
    }
  });
}
