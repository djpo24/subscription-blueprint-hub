
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';

interface CustomersPendingTableHeaderProps {
  customersCount: number;
  totalPendingAmount: number;
}

export function CustomersPendingTableHeader({ 
  customersCount, 
  totalPendingAmount 
}: CustomersPendingTableHeaderProps) {
  console.log('📊 [CustomersPendingTableHeader] Rendering with:', { customersCount, totalPendingAmount });
  
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes con Pagos Pendientes
          {customersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {customersCount}
            </Badge>
          )}
        </CardTitle>
        {customersCount > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-red-600">
              Total pendiente: {formatCurrency(totalPendingAmount, 'COP')}
            </span>
          </div>
        )}
      </div>
    </CardHeader>
  );
}
