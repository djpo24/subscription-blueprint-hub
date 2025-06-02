
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card className="min-h-[100px] sm:min-h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
            <span className="hidden sm:inline">Pendiente de Cobro</span>
            <span className="sm:hidden">Pendiente</span>
          </CardTitle>
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-red-600 leading-tight">
            {formatCurrency(total_pending)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pending_payment} paquetes
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[100px] sm:min-h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
            <span className="hidden sm:inline">Total Cobrado</span>
            <span className="sm:hidden">Cobrado</span>
          </CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">
            {formatCurrency(total_collected)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="hidden sm:inline">Recaudado exitosamente</span>
            <span className="sm:hidden">Exitoso</span>
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[100px] sm:min-h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
            <span className="hidden sm:inline">Eficiencia Entrega</span>
            <span className="sm:hidden">Eficiencia</span>
          </CardTitle>
          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold leading-tight">
            {total_packages > 0 ? Math.round((delivered_packages / total_packages) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {delivered_packages}/{total_packages}
          </p>
        </CardContent>
      </Card>

      <Card className="min-h-[100px] sm:min-h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
            <span className="hidden sm:inline">Vencidas +30 días</span>
            <span className="sm:hidden">Vencidas</span>
          </CardTitle>
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-orange-600 leading-tight">
            {overdue_30_days}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="hidden sm:inline">Requieren atención urgente</span>
            <span className="sm:hidden">Urgentes</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
