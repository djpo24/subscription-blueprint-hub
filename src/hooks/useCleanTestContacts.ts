
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCleanTestContacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🧹 Cleaning test contacts...');
      
      // Eliminar contactos de clientes con nombres de prueba o números 0
      const { data: testCustomers, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number')
        .or('name.ilike.%TEST_USER_DO_NOT_SAVE%,phone.eq.0000000000,whatsapp_number.eq.0000000000,phone.eq.0,whatsapp_number.eq.0');

      if (fetchError) {
        console.error('❌ Error fetching test customers:', fetchError);
        throw new Error('Error al buscar contactos de prueba');
      }

      if (!testCustomers || testCustomers.length === 0) {
        return { deletedCount: 0, message: 'No se encontraron contactos de prueba' };
      }

      console.log('🗑️ Found test customers to delete:', testCustomers.length);
      
      const customerIds = testCustomers.map(c => c.id);
      
      // Eliminar los contactos de prueba
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds);

      if (deleteError) {
        console.error('❌ Error deleting test customers:', deleteError);
        throw new Error('Error al eliminar contactos de prueba');
      }

      console.log('✅ Successfully deleted test customers:', testCustomers.length);
      
      return { 
        deletedCount: testCustomers.length, 
        deletedCustomers: testCustomers,
        message: `Se eliminaron ${testCustomers.length} contactos de prueba` 
      };
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['customer-data'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-contacts'] });
      
      toast({
        title: "Contactos limpiados",
        description: data.message || "Contactos de prueba eliminados exitosamente",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error cleaning test contacts:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron eliminar los contactos de prueba",
        variant: "destructive"
      });
    }
  });
}
