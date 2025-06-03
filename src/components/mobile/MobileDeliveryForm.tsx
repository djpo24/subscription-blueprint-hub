
import { useState } from 'react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { MobilePackageInfo } from './MobilePackageInfo';
import { MobilePaymentSection } from './MobilePaymentSection';
import { MobileDeliveryFormFields } from './MobileDeliveryFormFields';
import { MobileDeliveryActions } from './MobileDeliveryActions';
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
  
  const deliverPackage = useDeliverPackage();
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement(pkg.currency);

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

  const handleFormSubmit = () => {
    handleSubmit({} as React.FormEvent);
  };

  return (
    <div className="space-y-4">
      {/* Package Info */}
      <MobilePackageInfo package={pkg} />

      {/* Payment Section */}
      <MobilePaymentSection
        package={pkg}
        payments={payments}
        onAddPayment={addPayment}
        onUpdatePayment={handlePaymentUpdate}
        onRemovePayment={removePayment}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Delivery Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <MobileDeliveryFormFields
            deliveredBy={deliveredBy}
            setDeliveredBy={setDeliveredBy}
            notes={notes}
            setNotes={setNotes}
          />

          <MobileDeliveryActions
            package={pkg}
            payments={payments}
            deliveredBy={deliveredBy}
            isPending={deliverPackage.isPending}
            onCancel={onCancel}
            onSubmit={handleFormSubmit}
          />
        </div>
      </form>
    </div>
  );
}
