
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

  // Usar el ID del usuario en lugar del email
  const deliveredBy = user?.id || '';
  const deliveredByDisplay = user?.email || 'Usuario no identificado';

  const handleSubmit = async () => {
    console.log('🔄 [MobileDeliveryForm] Iniciando proceso de entrega...');
    console.log('📦 [MobileDeliveryForm] Paquete:', pkg);
    console.log('👤 [MobileDeliveryForm] Usuario:', user);
    console.log('🆔 [MobileDeliveryForm] Delivered by (ID):', deliveredBy);
    console.log('📧 [MobileDeliveryForm] Delivered by (Display):', deliveredByDisplay);
    console.log('💰 [MobileDeliveryForm] Pagos antes de procesar:', payments);

    if (!user || !deliveredBy) {
      console.error('❌ [MobileDeliveryForm] Usuario no autenticado o ID no disponible');
      alert('No se puede procesar la entrega: usuario no autenticado');
      return;
    }

    try {
      const validPayments = getValidPayments();
      console.log('✅ [MobileDeliveryForm] Pagos válidos para envío:', validPayments);

      // Asegurar que los pagos tengan el formato correcto
      const formattedPayments = validPayments.map(payment => ({
        method_id: payment.method_id,
        amount: Number(payment.amount),
        currency: payment.currency,
        type: payment.type
      }));

      console.log('💳 [MobileDeliveryForm] Pagos formateados:', formattedPayments);

      const deliveryData = {
        packageId: pkg.id,
        deliveredBy: deliveredBy, // Usar UUID del usuario
        payments: formattedPayments.length > 0 ? formattedPayments : undefined
      };

      console.log('📤 [MobileDeliveryForm] Enviando datos de entrega:', deliveryData);

      await deliverPackage.mutateAsync(deliveryData);

      console.log('✅ [MobileDeliveryForm] Entrega completada exitosamente');
      
      // Llamar onDeliveryComplete después de un breve delay para permitir que las queries se actualicen
      setTimeout(() => {
        console.log('🏁 [MobileDeliveryForm] Cerrando vista...');
        onDeliveryComplete();
      }, 1000);

    } catch (error) {
      console.error('❌ [MobileDeliveryForm] Error completo en handleSubmit:', error);
    }
  };

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 [MobileDeliveryForm] Actualizando pago:', { index, field, value });
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
          <span className="font-medium">Entregado por:</span> {deliveredByDisplay}
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
          deliveredBy={deliveredBy} // Pasar el UUID, no el email
          isPending={deliverPackage.isPending}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
