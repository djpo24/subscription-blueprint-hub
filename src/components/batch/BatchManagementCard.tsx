
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Weight, DollarSign, Truck, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BatchData {
  id: string;
  batch_number: string;
  batch_label: string;
  destination: string;
  total_packages: number;
  total_weight: number | null;
  total_freight: number | null;
  total_amount_to_collect: number | null;
  status: string;
  created_at: string;
}

interface BatchManagementCardProps {
  tripId: string;
  tripDate: Date;
  batches: BatchData[];
  onCreateBatch: (tripId: string) => void;
  onViewBatch: (batchId: string) => void;
}

export function BatchManagementCard({ 
  tripId, 
  tripDate, 
  batches, 
  onCreateBatch, 
  onViewBatch 
}: BatchManagementCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'ready':
        return 'Listo';
      case 'dispatched':
        return 'Despachado';
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const totalStats = batches.reduce(
    (acc, batch) => ({
      packages: acc.packages + batch.total_packages,
      weight: acc.weight + (batch.total_weight || 0),
      freight: acc.freight + (batch.total_freight || 0),
      amount_to_collect: acc.amount_to_collect + (batch.total_amount_to_collect || 0)
    }),
    { packages: 0, weight: 0, freight: 0, amount_to_collect: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Bultos del Viaje - {format(tripDate, "d 'de' MMMM", { locale: es })}
          </CardTitle>
          <Button
            onClick={() => onCreateBatch(tripId)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Bulto
          </Button>
        </div>
        
        {batches.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{totalStats.packages}</div>
              <div className="text-xs text-gray-600">Total Paquetes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{totalStats.weight} kg</div>
              <div className="text-xs text-gray-600">Peso Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{formatCurrency(totalStats.freight)}</div>
              <div className="text-xs text-gray-600">Flete Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(totalStats.amount_to_collect)}</div>
              <div className="text-xs text-gray-600">A Cobrar</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {batches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay bultos creados para este viaje</p>
            <p className="text-sm">Crea el primer bulto para organizar las encomiendas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-lg">{batch.batch_label}</div>
                    <Badge className={getStatusColor(batch.status)}>
                      {getStatusLabel(batch.status)}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewBatch(batch.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalles
                  </Button>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <strong>Destino:</strong> {batch.destination}
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{batch.total_packages}</div>
                      <div className="text-xs text-gray-500">Paquetes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">{batch.total_weight || 0} kg</div>
                      <div className="text-xs text-gray-500">Peso</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">{formatCurrency(batch.total_freight)}</div>
                      <div className="text-xs text-gray-500">Flete</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">{formatCurrency(batch.total_amount_to_collect)}</div>
                      <div className="text-xs text-gray-500">A Cobrar</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
