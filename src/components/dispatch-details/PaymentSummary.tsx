
import { Card, CardContent } from '@/components/ui/card';

interface PaymentEntry {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

interface PaymentSummaryProps {
  payments: PaymentEntry[];
  packageAmountToCollect: number;
  getCurrencySymbol: (currency: string) => string;
}

export function PaymentSummary({ payments, packageAmountToCollect, getCurrencySymbol }: PaymentSummaryProps) {
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = packageAmountToCollect - totalCollected;

  if (payments.length === 0) return null;

  return (
    <Card className="bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total a cobrar:</span>
            <span className="font-medium">
              {getCurrencySymbol('COP')}{packageAmountToCollect?.toLocaleString('es-CO') || 0} COP
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total recibido:</span>
            <span className="font-medium">
              {payments.length > 0 && payments[0].currency === 'AWG' 
                ? `${getCurrencySymbol('AWG')}${totalCollected.toLocaleString('es-CO')} AWG`
                : `${getCurrencySymbol('COP')}${totalCollected.toLocaleString('es-CO')} COP`
              }
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Pendiente:</span>
            <span className={`font-medium ${remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {getCurrencySymbol('COP')}{remainingAmount.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
