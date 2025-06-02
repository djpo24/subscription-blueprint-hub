
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Clock, TrendingDown, TrendingUp, Package } from 'lucide-react';

interface DebtSummaryProps {
  collectionStats: any;
}

export function DebtSummary({ collectionStats }: DebtSummaryProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  const {
    total_pending = 0,
    total_collected = 0,
    pending_payment = 0,
    overdue_30_days = 0,
    total_packages = 0,
    delivered_packages = 0
  } = collectionStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(total_pending)}
          </div>
          <p className="text-xs text-muted-foreground">
            {pending_payment} paquetes pendientes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(total_collected)}
          </div>
          <p className="text-xs text-muted-foreground">
            Recaudado exitosamente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia Entrega</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {total_packages > 0 ? Math.round((delivered_packages / total_packages) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {delivered_packages} de {total_packages} entregados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidas +30 días</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{overdue_30_days}</div>
          <p className="text-xs text-muted-foreground">
            Requieren atención urgente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
