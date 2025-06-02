
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Clock, TrendingDown, TrendingUp } from 'lucide-react';

interface DebtSummaryProps {
  debts: any[];
}

export function DebtSummary({ debts }: DebtSummaryProps) {
  const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.pending_amount || 0), 0);
  const totalPaid = debts.reduce((sum, debt) => sum + Number(debt.paid_amount || 0), 0);
  const activeDebts = debts.filter(debt => debt.status !== 'paid').length;
  const overdueDays30 = debts.filter(debt => {
    if (!debt.debt_start_date) return false;
    const daysDiff = Math.floor((new Date().getTime() - new Date(debt.debt_start_date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30 && debt.status !== 'paid';
  }).length;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalDebt)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pendiente por cobrar
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
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-muted-foreground">
            Recaudado a la fecha
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deudas Activas</CardTitle>
          <Calculator className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDebts}</div>
          <p className="text-xs text-muted-foreground">
            Paquetes con deuda
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidas +30 días</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{overdueDays30}</div>
          <p className="text-xs text-muted-foreground">
            Requieren atención
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
