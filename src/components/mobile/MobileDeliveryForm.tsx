
import { useState } from 'react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { useAuth } from '@/hooks/useAuth';
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
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  
  const deliverPackage = useDeliverPackage();
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement(pkg.currency);

  // Obtener el nombre del usuario logueado
  const deliveredBy = user?.email || 'Usuario no identificado';

  const handleSubmit = async () => {
    if (!user) {
      alert('No se puede procesar la entrega: usuario no autenticado');
      return;
    }

    try {
      const validPayments = getValidPayments();

      await deliverPackage.mutateAsync({
        packageId: pkg.id,
        deliveredBy: deliveredBy,
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

  return (
    <div className="space-y-4">
      {/* Package Info */}
      <MobilePackageInfo package={pkg} />

      {/* Delivery Info - Mostrar información del usuario logueado */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Información de Entrega</h3>
        <div className="text-sm text-blue-800">
          <span className="font-medium">Entregado por:</span> {deliveredBy}
        </div>
      </div>

      {/* Payment Section */}
      <MobilePaymentSection
        package={pkg}
        payments={payments}
        onAddPayment={addPayment}
        onUpdatePayment={handlePaymentUpdate}
        onRemovePayment={removePayment}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Delivery Form - Solo notas */}
      <div className="space-y-4">
        <MobileDeliveryFormFields
          deliveredBy=""
          setDeliveredBy={() => {}}
          notes={notes}
          setNotes={setNotes}
          hideDeliveredBy={true}
        />

        <MobileDeliveryActions
          package={pkg}
          payments={payments}
          deliveredBy={deliveredBy}
          isPending={deliverPackage.isPending}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
