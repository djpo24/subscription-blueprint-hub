
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
      try {
        return await DeliveryService.deliverPackage(params);
      } catch (error) {
        // Si es un error de permisos, intentamos el método alternativo
        if (DeliveryErrorHandler.isPermissionError(error)) {
          return await DeliveryFallbackService.deliverPackageWithFallback(params);
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      DeliverySuccessHandler.handleDeliverySuccess(queryClient, variables.deliveredBy);
    },
    onError: (error: any) => {
      DeliveryErrorHandler.handleDeliveryError(error);
    }
  });
}
