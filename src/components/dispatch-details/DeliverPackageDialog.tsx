
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, Plus, Trash2 } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import type { PackageInDispatch } from '@/types/dispatch';

interface DeliverPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageInDispatch | null;
}

interface PaymentEntry {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

export function DeliverPackageDialog({ 
  open, 
  onOpenChange, 
  package: pkg 
}: DeliverPackageDialogProps) {
  const [deliveredBy, setDeliveredBy] = useState('');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [notes, setNotes] = useState('');
  
  const { data: paymentMethods = [] } = usePaymentMethods();
  const deliverPackage = useDeliverPackage();

  // Filtrar métodos de pago solo para Florín y Peso
  const availablePaymentMethods = paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );

  const addPayment = () => {
    setPayments(prev => [...prev, {
      methodId: '',
      amount: '',
      currency: 'COP',
      type: 'partial'
    }]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentEntry, value: string) => {
    setPayments(prev => prev.map((payment, i) => {
      if (i === index) {
        const updatedPayment = { ...payment, [field]: value };
        
        // Si se actualiza el monto, recalcular el tipo automáticamente
        if (field === 'amount' && pkg) {
          const amount = parseFloat(value) || 0;
          const packageAmount = pkg.amount_to_collect || 0;
          updatedPayment.type = amount >= packageAmount ? 'full' : 'partial';
        }
        
        return updatedPayment;
      }
      return payment;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pkg || !deliveredBy.trim()) return;

    try {
      const validPayments = payments
        .filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0)
        .map(p => ({
          method_id: p.methodId,
          amount: parseFloat(p.amount),
          currency: p.currency,
          type: p.type
        }));

      await deliverPackage.mutateAsync({
        packageId: pkg.id,
        deliveredBy: deliveredBy.trim(),
        payments: validPayments.length > 0 ? validPayments : undefined
      });

      // Reset form
      setDeliveredBy('');
      setPayments([]);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error delivering package:', error);
    }
  };

  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = (pkg?.amount_to_collect || 0) - totalCollected;

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Entregar Paquete - {pkg.tracking_number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {pkg.customers?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Destino:</span> {pkg.destination}
                </div>
                <div>
                  <span className="font-medium">Monto a cobrar:</span> ${pkg.amount_to_collect?.toLocaleString('es-CO') || 0}
                </div>
                <div>
                  <span className="font-medium">Descripción:</span> {pkg.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="deliveredBy">Entregado por *</Label>
              <Input
                id="deliveredBy"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="Nombre de quien entrega"
                required
              />
            </div>
          </div>

          {/* Payments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Pagos recibidos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar pago
              </Button>
            </div>

            {payments.map((payment, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Pago #{index + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removePayment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Moneda</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={payment.currency === 'COP' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            updatePayment(index, 'currency', 'COP');
                            // Buscar método de pago en COP
                            const copMethod = availablePaymentMethods.find(m => m.currency === 'COP');
                            if (copMethod) {
                              updatePayment(index, 'methodId', copMethod.id);
                            }
                          }}
                        >
                          Peso (COP)
                        </Button>
                        <Button
                          type="button"
                          variant={payment.currency === 'AWG' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            updatePayment(index, 'currency', 'AWG');
                            // Buscar método de pago en AWG
                            const awgMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
                            if (awgMethod) {
                              updatePayment(index, 'methodId', awgMethod.id);
                            }
                          }}
                        >
                          Florín (AWG)
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={payment.amount}
                        onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Mostrar automáticamente el tipo calculado */}
                  {payment.amount && (
                    <div className="mt-2 text-sm text-gray-600">
                      Tipo de pago: <span className="font-medium">
                        {payment.type === 'full' ? 'Completo' : 'Parcial'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Payment Summary */}
            {payments.length > 0 && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total a cobrar:</span>
                      <span className="font-medium">${pkg.amount_to_collect?.toLocaleString('es-CO') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total recibido:</span>
                      <span className="font-medium">${totalCollected.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Pendiente:</span>
                      <span className={`font-medium ${remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        ${remainingAmount.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!deliveredBy.trim() || deliverPackage.isPending}
            >
              <Truck className="h-4 w-4 mr-2" />
              {deliverPackage.isPending ? 'Entregando...' : 'Confirmar Entrega'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
