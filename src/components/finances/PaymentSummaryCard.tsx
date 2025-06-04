
import { Card, CardContent } from '@/components/ui/card';

interface PaymentSummaryCardProps {
  remainingAmount: number;
  currency: string;
  currencySymbol?: string;
}

export function PaymentSummaryCard({ 
  remainingAmount, 
  currency, 
  currencySymbol = '$' 
}: PaymentSummaryCardProps) {
  if (remainingAmount <= 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <p className="text-sm text-orange-700">
          <strong>Atención:</strong> Queda un saldo pendiente de{' '}
          <strong>{currencySymbol}{remainingAmount.toLocaleString('es-CO')} {currency}</strong>.
          Puedes registrar más pagos arriba.
        </p>
      </CardContent>
    </Card>
  );
}
