
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, Package, MapPin, Truck, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomersPendingTableRowProps {
  customer: any;
  index: number;
  onRecordPayment: (customer: any) => void;
  onDeliver?: (customer: any) => void;
}

export function CustomersPendingTableRow({ 
  customer, 
  index, 
  onRecordPayment,
  onDeliver 
}: CustomersPendingTableRowProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDaysSinceDelivery = (deliveryDate: string | null) => {
    if (!deliveryDate) return 0;
    try {
      const delivery = new Date(deliveryDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - delivery.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const getUrgencyBadgeColor = (days: number) => {
    if (days >= 30) return 'destructive';
    if (days >= 15) return 'secondary';
    return 'outline';
  };

  const daysSinceDelivery = getDaysSinceDelivery(customer.delivery_date);

  return (
    <TableRow 
      key={`${customer.package_id}-${customer.customer_name}-${index}`}
      className="hover:bg-gray-50"
    >
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{customer.customer_name}</div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Phone className="h-3 w-3" />
            {customer.customer_phone}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-mono">
            {customer.tracking_number}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{customer.destination}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-500" />
          <span className="text-sm">
            {formatDate(customer.delivery_date)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={getUrgencyBadgeColor(daysSinceDelivery)}
          className="text-xs"
        >
          {daysSinceDelivery} días
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium text-red-600">
          {formatCurrency(customer.pending_amount || 0, customer.currency as 'COP' | 'AWG' || 'COP')}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onRecordPayment(customer)}
            className="flex items-center gap-1"
          >
            <DollarSign className="h-3 w-3" />
            Registrar Pago
          </Button>
          {onDeliver && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeliver(customer)}
              className="flex items-center gap-1"
            >
              <Truck className="h-3 w-3" />
              Entregar
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
