
import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export class DeliverySuccessHandler {
  static handleDeliverySuccess(queryClient: QueryClient, deliveredByEmail: string) {
    console.log('🎉 Entrega exitosa, invalidando queries...');
    
    // Invalidar todas las queries relevantes
    queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['debt-data'] });
    queryClient.invalidateQueries({ queryKey: ['collection-packages'] });
    
    // Mostrar toast de éxito
    toast({
      title: "¡Entrega exitosa!",
      description: `Paquete entregado correctamente por ${deliveredByEmail}`,
    });
    
    console.log('✅ Queries invalidadas y toast mostrado');
  }
}
