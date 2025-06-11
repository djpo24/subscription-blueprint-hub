
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Package, Weight, DollarSign, Calendar, Eye, Trash2 } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatCurrency, formatWeight } from './dispatchUtils';
import { formatAmountToCollectWithCurrency, parseCurrencyString } from '@/utils/currencyFormatter';
import { formatDispatchDate } from '@/utils/dateUtils';
import { DeleteDispatchDialog } from './DeleteDispatchDialog';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  notes?: string;
  status: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
  amounts_by_currency: Record<string, number>;
  primary_currency: string | null;
}

interface DispatchesDesktopViewProps {
  dispatches: DispatchRelation[];
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesDesktopView({ dispatches, onViewDispatch }: DispatchesDesktopViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<{ id: string; date: string } | null>(null);
  const { data: userRole } = useCurrentUserRole();

  const isAdmin = userRole?.role === 'admin';

  const formatAmountToCollectDisplay = (dispatch: DispatchRelation) => {
    // Si no hay montos a cobrar, mostrar ---
    if (!dispatch.amounts_by_currency || Object.keys(dispatch.amounts_by_currency).length === 0) {
      return '---';
    }

    const currencies = Object.keys(dispatch.amounts_by_currency);
    if (currencies.length === 1) {
      const currency = currencies[0];
      const amount = dispatch.amounts_by_currency[currency];
      const parsedCurrency = parseCurrencyString(currency);
      return formatAmountToCollectWithCurrency(amount, parsedCurrency);
    }

    const primaryCurrency = dispatch.primary_currency || currencies[0];
    const amount = dispatch.amounts_by_currency[primaryCurrency];
    const parsedCurrency = parseCurrencyString(primaryCurrency);
    
    const totalCurrencies = currencies.length;
    const formattedAmount = formatAmountToCollectWithCurrency(amount, parsedCurrency);
    
    return totalCurrencies > 1 ? `${formattedAmount} (+${totalCurrencies - 1} más)` : formattedAmount;
  };

  const handleDeleteClick = (dispatch: DispatchRelation) => {
    setSelectedDispatch({
      id: dispatch.id,
      date: formatDispatchDate(dispatch.dispatch_date)
    });
    setDeleteDialogOpen(true);
  };

  return (
    <>
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
                  {formatDispatchDate(dispatch.dispatch_date)}
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
                    {formatAmountToCollectDisplay(dispatch)}
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDispatch(dispatch.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Ver
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(dispatch)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteDispatchDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dispatchId={selectedDispatch?.id || null}
        dispatchDate={selectedDispatch?.date || ''}
      />
    </>
  );
}
