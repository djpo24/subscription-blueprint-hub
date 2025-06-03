import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Check, X, ChevronDown, ChevronUp, Plus, DollarSign } from 'lucide-react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { PaymentEntry } from '../dispatch-details/PaymentEntry';
import { PaymentSummary } from '../dispatch-details/PaymentSummary';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobileDeliveryFormProps {
  package: PackageInDispatch;
  onDeliveryComplete: () => void;
  onCancel: () => void;
}

export function MobileDeliveryForm({ 
  package: pkg, 
  onDeliveryComplete, 
  onCancel 
}: MobileDeliveryFormProps) {
  const [deliveredBy, setDeliveredBy] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  
  const deliverPackage = useDeliverPackage();
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement(pkg.currency); // Pass package currency to hook

  // Determinar si el paquete requiere cobro
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveredBy.trim()) {
      alert('Por favor ingresa el nombre de quien entrega');
      return;
    }

    try {
      const validPayments = getValidPayments();

      await deliverPackage.mutateAsync({
        packageId: pkg.id,
        deliveredBy: deliveredBy.trim(),
        payments: validPayments.length > 0 ? validPayments : undefined
      });

      alert('¡Paquete entregado exitosamente!');
      onDeliveryComplete();
    } catch (error) {
      console.error('Error delivering package:', error);
      alert('Error al entregar el paquete. Intenta nuevamente.');
    }
  };

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    updatePayment(index, field as any, value, pkg.amount_to_collect || 0);
  };

  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = (pkg.amount_to_collect || 0) - totalCollected;

  return (
    <div className="space-y-4">
      {/* Package Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {pkg.tracking_number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Cliente:</span>
              <span>{pkg.customers?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Destino:</span>
              <span>{pkg.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Descripción:</span>
              <span className="text-right">{pkg.description}</span>
            </div>
            {requiresPayment && (
              <>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-600">Monto a cobrar:</span>
                  <span className="font-bold text-green-600">
                    ${pkg.amount_to_collect?.toLocaleString('es-CO')} {pkg.currency || 'COP'}
                  </span>
                </div>
                {pkg.currency && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Moneda:</span>
                    <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                      {pkg.currency === 'AWG' ? 'Florín (AWG)' : 'Peso (COP)'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Section - Solo si requiere cobro */}
      {requiresPayment && (
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
                    onClick={addPayment}
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
                    onUpdate={handlePaymentUpdate}
                    onRemove={removePayment}
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
      )}

      {/* Delivery Form */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmar Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Delivered By */}
            <div>
              <Label htmlFor="deliveredBy">Entregado por *</Label>
              <Input
                id="deliveredBy"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="Nombre de quien entrega"
                required
                className="mt-1"
              />
            </div>

            {/* Notes Section */}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="mb-2 w-full justify-between"
              >
                <span>Agregar notas (opcional)</span>
                {showNotes ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {showNotes && (
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Payment Warning for uncollected amounts */}
            {requiresPayment && remainingAmount > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <p className="text-sm text-orange-700">
                    <strong>Atención:</strong> Queda un saldo pendiente de{' '}
                    <strong>${remainingAmount.toLocaleString('es-CO')} {pkg.currency || 'COP'}</strong>.
                    {!showPayments && ' Puedes registrar los pagos arriba.'}
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
                type="submit"
                disabled={!deliveredBy.trim() || deliverPackage.isPending}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                {deliverPackage.isPending ? 'Entregando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
