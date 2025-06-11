
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Package, Weight, DollarSign, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusColor, getStatusLabel, formatCurrency, formatWeight } from './dispatchUtils';
import { formatAmountToCollectWithCurrency, parseCurrencyString } from '@/utils/currencyFormatter';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  notes?: string;
  status: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
}

interface DispatchesDesktopViewProps {
  dispatches: DispatchRelation[];
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesDesktopView({ dispatches, onViewDispatch }: DispatchesDesktopViewProps) {
  const formatAmountToCollectDisplay = (amount: number | null | undefined, currencyStr: string | null | undefined) => {
    if (!amount || amount === 0) return '---';
    
    const currency = parseCurrencyString(currencyStr);
    return formatAmountToCollectWithCurrency(amount, currency);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Paquetes</TableHead>
          <TableHead>Peso Total</TableHead>
          <TableHead>Flete Total</TableHead>
          <TableHead>A Cobrar</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Notas</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dispatches.map((dispatch) => (
          <TableRow key={dispatch.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {format(new Date(dispatch.dispatch_date), 'dd/MM/yyyy')}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{dispatch.total_packages}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-purple-500" />
                <span>{formatWeight(dispatch.total_weight)} kg</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-500" />
                <span>{formatCurrency(dispatch.total_freight)}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">
                  {formatAmountToCollectDisplay(dispatch.total_amount_to_collect, 'COP')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(dispatch.status)}>
                {getStatusLabel(dispatch.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="max-w-32 truncate text-sm text-gray-600">
                {dispatch.notes || '-'}
              </div>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDispatch(dispatch.id)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                Ver
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
