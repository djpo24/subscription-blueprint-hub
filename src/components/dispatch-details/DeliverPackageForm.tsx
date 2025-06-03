
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { PackageInfo } from './PackageInfo';
import { DeliveryFormFields } from './DeliveryFormFields';
import { PaymentSection } from './PaymentSection';
import type { PackageInDispatch } from '@/types/dispatch';

interface DeliverPackageFormProps {
  package: PackageInDispatch;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeliverPackageForm({ 
  package: pkg, 
  onSuccess, 
  onCancel 
}: DeliverPackageFormProps) {
  const [deliveredBy, setDeliveredBy] = useState('');
  const [notes, setNotes] = useState('');
  
  const deliverPackage = useDeliverPackage();
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveredBy.trim()) return;

    try {
      const validPayments = getValidPayments();

      await deliverPackage.mutateAsync({
        packageId: pkg.id,
        deliveredBy: deliveredBy.trim(),
        payments: validPayments.length > 0 ? validPayments : undefined
      });

      // Reset form
      setDeliveredBy('');
      setNotes('');
      resetPayments();
      onSuccess();
    } catch (error) {
      console.error('Error delivering package:', error);
    }
  };

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    updatePayment(index, field as any, value, pkg.amount_to_collect || 0);
  };

  return (
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
        onUpdatePayment={handlePaymentUpdate}
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
        <Button type="button" variant="outline" onClick={onCancel}>
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
  );
}
