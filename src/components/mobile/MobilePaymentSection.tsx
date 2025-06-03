
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DollarSign, MessageSquare } from 'lucide-react';
import { PaymentEntry } from '../dispatch-details/PaymentEntry';
import { PaymentSummary } from '../dispatch-details/PaymentSummary';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import type { PackageInDispatch } from '@/types/dispatch';
import type { PaymentEntryData } from '@/types/payment';

interface MobilePaymentSectionProps {
  package: PackageInDispatch;
  payments: PaymentEntryData[];
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: string, value: string) => void;
  onRemovePayment: (index: number) => void;
  getCurrencySymbol: (currency: string) => string;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function MobilePaymentSection({
  package: pkg,
  payments,
  onUpdatePayment,
  getCurrencySymbol,
  onOpenChat,
  previewRole,
  disableChat = false
}: MobilePaymentSectionProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  
  if (!requiresPayment) return null;

  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  // Obtener la moneda del pago (si hay pagos registrados)
  const paymentCurrency = payments.length > 0 && payments[0].currency ? payments[0].currency : pkg.currency || 'COP';
  
  // Convertir el monto del paquete a la moneda del pago si es necesario
  const packageAmountInPaymentCurrency = pkg.amount_to_collect || 0;
  const remainingAmount = packageAmountInPaymentCurrency - totalCollected;

  const handleChatClick = () => {
    if (onOpenChat && !disableChat && userRole?.role === 'admin') {
      onOpenChat(pkg.customer_id, pkg.customers?.name);
    }
  };

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-green-800">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cobro Requerido
          </div>
          {canShowChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatClick}
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-sm text-green-700">
            <strong>Cliente:</strong> {pkg.customers?.name || 'N/A'}
          </p>
          <p className="text-sm text-green-700">
            <strong>Total a cobrar:</strong> ${pkg.amount_to_collect?.toLocaleString('es-CO')} {pkg.currency || 'COP'}
          </p>
          {totalCollected > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">
                <strong>Recibido:</strong> ${totalCollected.toLocaleString('es-CO')} {paymentCurrency}
              </p>
              <p className={`${remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                <strong>Pendiente:</strong> ${remainingAmount.toLocaleString('es-CO')} {paymentCurrency}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-green-800">Registrar pago</Label>

          {payments.length > 0 && (
            <PaymentEntry
              payment={payments[0]}
              index={0}
              onUpdate={onUpdatePayment}
              onRemove={() => {}}
              canRemove={false}
            />
          )}

          <PaymentSummary
            payments={payments}
            packageAmountToCollect={pkg.amount_to_collect || 0}
            getCurrencySymbol={getCurrencySymbol}
          />
        </div>
      </CardContent>
    </Card>
  );
}
