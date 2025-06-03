
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, Truck, Plus } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { PaymentEntry } from './PaymentEntry';
import { PaymentSummary } from './PaymentSummary';
import { PackageInfo } from './PackageInfo';
import type { PackageInDispatch } from '@/types/dispatch';

interface DeliverPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageInDispatch | null;
}

interface PaymentEntryData {
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
  const [payments, setPayments] = useState<PaymentEntryData[]>([]);
  const [notes, setNotes] = useState('');
  
  const { data: paymentMethods = [] } = usePaymentMethods();
  const deliverPackage = useDeliverPackage();

  // Filtrar métodos de pago solo para Florín y Peso
  const availablePaymentMethods = paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );

  const addPayment = () => {
    // Predeterminar Florín (AWG) como moneda por defecto
    const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
    setPayments(prev => [...prev, {
      methodId: defaultMethod?.id || '',
      amount: '',
      currency: 'AWG',
      type: 'partial'
    }]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string) => {
    setPayments(prev => prev.map((payment, i) => {
      if (i === index) {
        const updatedPayment = { ...payment, [field]: value };
        
        // Si se actualiza la moneda, buscar un método de pago apropiado
        if (field === 'currency') {
          const methodForCurrency = availablePaymentMethods.find(m => m.currency === value);
          if (methodForCurrency) {
            updatedPayment.methodId = methodForCurrency.id;
          }
        }
        
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

  // Función para obtener el símbolo de moneda
  const getCurrencySymbol = (currency: string) => {
    const method = availablePaymentMethods.find(m => m.currency === currency);
    return method?.symbol || '$';
  };

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
          <PackageInfo package={pkg} />

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
              <PaymentEntry
                key={index}
                payment={payment}
                index={index}
                onUpdate={updatePayment}
                onRemove={removePayment}
              />
            ))}

            {/* Payment Summary */}
            <PaymentSummary
              payments={payments}
              packageAmountToCollect={pkg.amount_to_collect || 0}
              getCurrencySymbol={getCurrencySymbol}
            />
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
