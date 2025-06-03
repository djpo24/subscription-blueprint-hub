
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { useAuth } from '@/hooks/useAuth';
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
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  
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

  // Obtener el nombre del usuario logueado
  const deliveredBy = user?.email || 'Usuario no identificado';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Reset form
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

      {/* Delivery Info - Mostrar información del usuario logueado */}
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Información de Entrega</h3>
          <div className="text-sm text-blue-800">
            <span className="font-medium">Entregado por:</span> {deliveredBy}
          </div>
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

      {/* Notes Section - Solo notas, sin campo de entregado por */}
      <DeliveryFormFields
        deliveredBy=""
        setDeliveredBy={() => {}}
        notes={notes}
        setNotes={setNotes}
        hideDeliveredBy={true}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={!user || deliverPackage.isPending}
        >
          <Truck className="h-4 w-4 mr-2" />
          {deliverPackage.isPending ? 'Entregando...' : 'Confirmar Entrega'}
        </Button>
      </div>
    </form>
  );
}
