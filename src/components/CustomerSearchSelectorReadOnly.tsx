
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

interface CustomerSearchSelectorReadOnlyProps {
  selectedCustomerId: string;
}

export function CustomerSearchSelectorReadOnly({ selectedCustomerId }: CustomerSearchSelectorReadOnlyProps) {
  const { data: selectedCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-details', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      
      console.log('Buscando detalles del cliente:', selectedCustomerId);
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number')
        .eq('id', selectedCustomerId)
        .maybeSingle();
      
      if (error) {
        console.error('Error al buscar cliente:', error);
        throw error;
      }
      
      console.log('Cliente encontrado:', data);
      return data;
    },
    enabled: !!selectedCustomerId
  });

  if (customerLoading) {
    return (
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
          Cargando cliente...
        </div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
          {selectedCustomer.name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {selectedCustomer.email} • {selectedCustomer.phone}
        </div>
      </div>
    );
  } else if (selectedCustomerId) {
    return (
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
          Cliente no encontrado
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
          Sin cliente asignado
        </div>
      </div>
    );
  }
}
