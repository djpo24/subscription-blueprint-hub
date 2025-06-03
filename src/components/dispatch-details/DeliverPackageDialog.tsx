
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Truck } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { PackageInfo } from './PackageInfo';
import { DeliveryFormFields } from './DeliveryFormFields';
import { PaymentSection } from './PaymentSection';
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
  const [notes, setNotes] = useState('');
  
  const { data: paymentMethods = [] } = usePaymentMethods();
  const deliverPackage = useDeliverPackage();

  // Filtrar métodos de pago solo para Florín y Peso
  const availablePaymentMethods = paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );

  // Inicializar con una entrada de pago por defecto (Florín)
  const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
  const [payments, setPayments] = useState<PaymentEntryData[]>([{
    methodId: defaultMethod?.id || '',
    amount: '',
    currency: 'AWG',
    type: 'partial'
  }]);

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
    // No permitir eliminar si solo hay una entrada
    if (payments.length > 1) {
      setPayments(prev => prev.filter((_, i) => i !== index));
    }
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

      // Reset form manteniendo una entrada de pago por defecto
      setDeliveredBy('');
      setPayments([{
        methodId: defaultMethod?.id || '',
        amount: '',
        currency: 'AWG',
        type: 'partial'
      }]);
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

          {/* Delivery Info - Solo campo "Entregado por" */}
          <div className="space-y-4">
            <div>
              <label htmlFor="deliveredBy" className="block text-sm font-medium text-gray-700 mb-1">
                Entregado por *
              </label>
              <input
                id="deliveredBy"
                type="text"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="Nombre de quien entrega"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Section */}
          <PaymentSection
            payments={payments}
            onAddPayment={addPayment}
            onUpdatePayment={updatePayment}
            onRemovePayment={removePayment}
            packageAmountToCollect={pkg.amount_to_collect || 0}
            getCurrencySymbol={getCurrencySymbol}
          />

          {/* Notes Section - Ahora debajo de pagos */}
          <DeliveryFormFields
            deliveredBy=""
            setDeliveredBy={() => {}}
            notes={notes}
            setNotes={setNotes}
          />

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
