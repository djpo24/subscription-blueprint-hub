
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Weight, Calendar, Eye, Trash2 } from 'lucide-react';
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

interface DispatchesMobileViewProps {
  dispatches: DispatchRelation[];
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesMobileView({ dispatches, onViewDispatch }: DispatchesMobileViewProps) {
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
      <div className="space-y-3">
        {dispatches.map((dispatch) => (
          <Card key={dispatch.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {formatDispatchDate(dispatch.dispatch_date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-blue-500" />
                        <span>{dispatch.total_packages} paquetes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3 text-purple-500" />
                        <span>{formatWeight(dispatch.total_weight)} kg</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(dispatch.status)} text-xs`}>
                    {getStatusLabel(dispatch.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Flete:</span>
                    <span className="font-medium ml-1">{formatCurrency(dispatch.total_freight)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">A Cobrar:</span>
                    <span className="font-medium text-green-600 ml-1">
                      {formatAmountToCollectDisplay(dispatch)}
                    </span>
                  </div>
                </div>

                {dispatch.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notas:</span>
                    <p className="text-gray-700 truncate mt-1">{dispatch.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDispatch(dispatch.id)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    Ver Detalles
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(dispatch)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteDispatchDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dispatchId={selectedDispatch?.id || null}
        dispatchDate={selectedDispatch?.date || ''}
      />
    </>
  );
}
