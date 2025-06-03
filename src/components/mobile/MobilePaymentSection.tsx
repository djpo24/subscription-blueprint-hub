
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DollarSign, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { PaymentEntry } from '../dispatch-details/PaymentEntry';
import { PaymentSummary } from '../dispatch-details/PaymentSummary';
import type { PackageInDispatch } from '@/types/dispatch';
import type { PaymentEntryData } from '@/types/payment';

interface MobilePaymentSectionProps {
  package: PackageInDispatch;
  payments: PaymentEntryData[];
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: string, value: string) => void;
  onRemovePayment: (index: number) => void;
  getCurrencySymbol: (currency: string) => string;
}

export function MobilePaymentSection({
  package: pkg,
  payments,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
  getCurrencySymbol
}: MobilePaymentSectionProps) {
  const [showPayments, setShowPayments] = useState(false);
  
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  
  if (!requiresPayment) return null;

  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = (pkg.amount_to_collect || 0) - totalCollected;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Cobro Requerido
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPayments(!showPayments)}
          >
            {showPayments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-sm text-green-700">
            <strong>Total a cobrar:</strong> ${pkg.amount_to_collect?.toLocaleString('es-CO')} {pkg.currency || 'COP'}
          </p>
          {showPayments && totalCollected > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">
                <strong>Recibido:</strong> ${totalCollected.toLocaleString('es-CO')} 
                {payments.length > 0 && payments[0].currency === 'AWG' ? ' AWG' : ` ${pkg.currency || 'COP'}`}
              </p>
              <p className={`${remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                <strong>Pendiente:</strong> ${remainingAmount.toLocaleString('es-CO')} {pkg.currency || 'COP'}
              </p>
            </div>
          )}
        </div>

        {showPayments && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-green-800">Registrar pagos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddPayment}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar pago
              </Button>
            </div>

            {payments.map((payment, index) => (
              <PaymentEntry
                key={index}
                payment={payment}
                index={index}
                onUpdate={onUpdatePayment}
                onRemove={onRemovePayment}
                canRemove={payments.length > 1}
              />
            ))}

            <PaymentSummary
              payments={payments}
              packageAmountToCollect={pkg.amount_to_collect || 0}
              getCurrencySymbol={getCurrencySymbol}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
