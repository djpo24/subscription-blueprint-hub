
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryService } from '@/services/deliveryService';
import { DeliveryFallbackService } from '@/services/deliveryFallbackService';
import { DeliveryErrorHandler } from '@/utils/deliveryErrorHandler';
import { DeliverySuccessHandler } from '@/utils/deliverySuccessHandler';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DeliveryPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}

interface DeliverPackageParams {
  packageId: string;
  deliveredBy: string; // Este es el UUID del usuario
  payments?: DeliveryPayment[];
}

export function useDeliverPackage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (params: DeliverPackageParams) => {
      console.log('🎯 [useDeliverPackage] Iniciando proceso de entrega:', params);
      console.log('💰 [useDeliverPackage] Pagos a procesar:', params.payments);
      
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
        const { shouldTryFallback, userMessage } = DeliveryErrorHandler.handleDeliveryError(error);
        
        if (shouldTryFallback || DeliveryErrorHandler.isPermissionError(error)) {
          console.log('🔄 [useDeliverPackage] Intentando método alternativo...');
          try {
            const fallbackResult = await DeliveryFallbackService.deliverPackageWithFallback(params);
            console.log('✅ [useDeliverPackage] Método alternativo exitoso:', fallbackResult);
            return fallbackResult;
          } catch (fallbackError) {
            console.error('❌ [useDeliverPackage] Error en método alternativo:', fallbackError);
            
            // Mostrar toast de error específico
            toast({
              title: "Error en la entrega",
              description: userMessage,
              variant: "destructive"
            });
            
            throw fallbackError;
          }
        } else {
          console.log('🚫 [useDeliverPackage] No se intentará método alternativo');
          
          // Mostrar toast de error
          toast({
            title: "Error en la entrega",
            description: userMessage,
            variant: "destructive"
          });
          
          throw error;
        }
      }
    },
    onSuccess: (data, variables) => {
      console.log('🎉 [useDeliverPackage] Entrega exitosa:', { data, variables });
      console.log('💰 [useDeliverPackage] Pagos procesados:', variables.payments);
      
      // Pasar el email del usuario al success handler
      const deliveredByEmail = user?.email || 'Usuario no identificado';
      DeliverySuccessHandler.handleDeliverySuccess(queryClient, deliveredByEmail);
    },
    onError: (error: any) => {
      console.error('💥 [useDeliverPackage] Error final en entrega:', error);
      // El error ya fue manejado en mutationFn, aquí solo loggeamos
    }
  });
}
