import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RedemptionModal } from './RedemptionModal';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  id_number?: string;
}

export function PointRedemptionPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as Customer[];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Panel de Redención de Puntos
          </CardTitle>
          <CardDescription>
            Busca un cliente por nombre, teléfono o cédula para redimir sus puntos.
            <br />
            <strong>1,000 puntos = 1 kilo</strong> | Los puntos de hace más de 1 año se pierden automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                Buscando...
              </div>
            )}

            {searchTerm.length >= 2 && customers.length > 0 && (
              <div className="border rounded-lg divide-y">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phone}
                      {customer.id_number && ` • ${customer.id_number}`}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchTerm.length >= 2 && customers.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron clientes que coincidan con "{searchTerm}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RedemptionModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
