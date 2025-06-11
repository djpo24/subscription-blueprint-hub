
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Weight, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusColor, getStatusLabel, formatCurrency, formatWeight } from './dispatchUtils';

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

interface DispatchesMobileViewProps {
  dispatches: DispatchRelation[];
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesMobileView({ dispatches, onViewDispatch }: DispatchesMobileViewProps) {
  return (
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
                      {format(new Date(dispatch.dispatch_date), 'dd/MM/yyyy')}
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
                    {formatCurrency(dispatch.total_amount_to_collect)}
                  </span>
                </div>
              </div>

              {dispatch.notes && (
                <div className="text-sm">
                  <span className="text-gray-500">Notas:</span>
                  <p className="text-gray-700 truncate mt-1">{dispatch.notes}</p>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDispatch(dispatch.id)}
                className="w-full flex items-center gap-2"
              >
                <Eye className="h-3 w-3" />
                Ver Detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
