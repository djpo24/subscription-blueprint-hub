
import { Users } from 'lucide-react';

interface CustomersStatsSectionProps {
  searchCustomerId: string | null;
  filteredCustomersCount: number;
  totalCustomersCount: number;
}

export function CustomersStatsSection({
  searchCustomerId,
  filteredCustomersCount,
  totalCustomersCount
}: CustomersStatsSectionProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Users className="h-5 w-5" />
      <span className="font-medium">Lista de Clientes</span>
      {searchCustomerId && (
        <span className="text-sm font-normal text-muted-foreground">
          (Mostrando resultado de búsqueda)
        </span>
      )}
      <div className="ml-auto text-sm text-muted-foreground">
        {searchCustomerId 
          ? `${filteredCustomersCount} cliente${filteredCustomersCount !== 1 ? 's' : ''} encontrado${filteredCustomersCount !== 1 ? 's' : ''}`
          : `Total de clientes: ${totalCustomersCount}`
        }
      </div>
    </div>
  );
}
