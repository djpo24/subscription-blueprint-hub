
import { useState } from 'react';
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
    setPayments(prev => prev.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    ));
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
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Método de pago</Label>
                      <Select 
                        value={payment.methodId} 
                        onValueChange={(value) => {
                          updatePayment(index, 'methodId', value);
                          const method = paymentMethods.find(m => m.id === value);
                          if (method) {
                            updatePayment(index, 'currency', method.currency);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    
                    <div>
                      <Label>Tipo</Label>
                      <Select 
                        value={payment.type} 
                        onValueChange={(value: 'full' | 'partial') => updatePayment(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Completo</SelectItem>
                          <SelectItem value="partial">Parcial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
