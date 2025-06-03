
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Phone, Package } from 'lucide-react';

interface DebtorsMobileCardProps {
  debt: any;
  formatCurrency: (value: number | string, currency?: string) => string;
  getCurrencyLabel: (currency: string) => string;
  getDebtTypeLabel: (debtType: string) => string;
  getDebtTypeColor: (debtType: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function DebtorsMobileCard({ 
  debt, 
  formatCurrency, 
  getCurrencyLabel,
  getDebtTypeLabel, 
  getDebtTypeColor, 
  getStatusLabel, 
  getStatusColor 
}: DebtorsMobileCardProps) {
  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-sm font-medium">{debt.tracking_number}</div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(debt.pending_amount, debt.currency)}
              </div>
              <div className="text-xs text-gray-500">
                {getCurrencyLabel(debt.currency)}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${debt.debt_days > 30 ? 'text-red-600' : debt.debt_days > 15 ? 'text-orange-600' : 'text-gray-900'}`}>
                {debt.debt_days} días
              </div>
              <div className="text-xs text-gray-500">de mora</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{debt.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{debt.customer_phone}</span>
            </div>
          </div>

          {/* Location and Traveler */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{debt.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{debt.traveler_name}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getDebtTypeColor(debt.debt_type)}>
              {getDebtTypeLabel(debt.debt_type)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(debt.debt_status)}>
              {getStatusLabel(debt.debt_status)}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              Inicio: {debt.debt_start_date ? new Date(debt.debt_start_date).toLocaleDateString('es-CO') : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
