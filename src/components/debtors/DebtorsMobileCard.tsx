
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DebtorsMobileCardProps {
  debt: any;
  formatCurrency: (value: number | string) => string;
  getDebtTypeLabel: (debtType: string) => string;
  getDebtTypeColor: (debtType: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function DebtorsMobileCard({ 
  debt, 
  formatCurrency, 
  getDebtTypeLabel, 
  getDebtTypeColor, 
  getStatusLabel, 
  getStatusColor 
}: DebtorsMobileCardProps) {
  return (
    <Card key={debt.debt_id || debt.package_id} className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{debt.tracking_number}</h3>
            <p className="text-sm text-gray-600 truncate">{debt.customer_name}</p>
            <p className="text-xs text-gray-500">{debt.customer_phone}</p>
          </div>
          <div className="flex flex-col items-end gap-1 ml-2">
            <Badge className={`${getDebtTypeColor(debt.debt_type)} text-xs`}>
              {getDebtTypeLabel(debt.debt_type)}
            </Badge>
            <Badge className={`${getStatusColor(debt.debt_status)} text-xs`}>
              {getStatusLabel(debt.debt_status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Destino</p>
            <p className="font-medium text-sm truncate">{debt.destination}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Viajero</p>
            <p className="font-medium text-sm truncate">{debt.traveler_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Días de deuda</p>
            <p className={`font-medium text-sm ${
              debt.debt_days > 30 ? 'text-red-600' : 
              debt.debt_days > 15 ? 'text-orange-600' : 'text-gray-900'
            }`}>
              {debt.debt_days || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Fecha deuda</p>
            <p className="font-medium text-sm">
              {debt.debt_start_date ? 
                format(new Date(debt.debt_start_date), 'dd/MM/yy', { locale: es }) 
                : 'N/A'
              }
            </p>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Pendiente:</span>
            <span className="font-bold text-red-600">{formatCurrency(debt.pending_amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Pagado:</span>
            <span className="font-medium text-green-600">{formatCurrency(debt.paid_amount)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <DollarSign className="mr-1 h-3 w-3" />
            Pagar
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            Historial
          </Button>
        </div>
      </div>
    </Card>
  );
}
