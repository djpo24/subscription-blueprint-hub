
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';
import type { PaymentEntryData } from '@/types/payment';

interface MobileDeliveryActionsProps {
  package: PackageInDispatch;
  payments: PaymentEntryData[];
  deliveredBy: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function MobileDeliveryActions({
  package: pkg,
  payments,
  deliveredBy,
  isPending,
  onCancel,
  onSubmit
}: MobileDeliveryActionsProps) {
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  
  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = (pkg.amount_to_collect || 0) - totalCollected;
  const packageCurrency = pkg.currency || 'COP';
  
  console.log('🎯 [MobileDeliveryActions] Package currency:', packageCurrency);
  console.log('🎯 [MobileDeliveryActions] Remaining amount:', remainingAmount);
  
  // Obtener símbolo de divisa
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'AWG': 'ƒ',
      'USD': '$',
      'COP': '$'
    };
    
    const symbol = symbols[currency as keyof typeof symbols] || '$';
    console.log('💱 [MobileDeliveryActions] Currency symbol for', currency, ':', symbol);
    return symbol;
  };

  const currencySymbol = getCurrencySymbol(packageCurrency);

  return (
    <div className="space-y-3">
      {/* Payment Warning for uncollected amounts */}
      {requiresPayment && remainingAmount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <p className="text-sm text-orange-700">
              <strong>Atención:</strong> Queda un saldo pendiente de{' '}
              <strong>{currencySymbol}{remainingAmount.toLocaleString('es-CO')} {packageCurrency}</strong>.
              Puedes registrar los pagos arriba.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={!deliveredBy.trim() || isPending}
          className="w-full"
          onClick={onSubmit}
        >
          <Check className="h-4 w-4 mr-2" />
          {isPending ? 'Entregando...' : 'Confirmar'}
        </Button>
      </div>
    </div>
  );
}
