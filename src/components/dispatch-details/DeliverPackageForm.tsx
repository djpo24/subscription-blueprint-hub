
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { useAuth } from '@/hooks/useAuth';
import { MobilePackageInfo } from '@/components/mobile/MobilePackageInfo';
import { MobilePaymentSection } from '@/components/mobile/MobilePaymentSection';
import { MobileDeliveryFormFields } from '@/components/mobile/MobileDeliveryFormFields';
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
  } = usePaymentManagement(pkg.currency);

  // Obtener el nombre del usuario logueado
  const deliveredBy = user?.email || 'Usuario no identificado';

  const handleSubmit = async () => {
    console.log('🔄 Iniciando proceso de entrega...');
    console.log('📦 Paquete:', pkg);
    console.log('👤 Usuario:', user);
    console.log('💰 Pagos:', payments);

    if (!user) {
      console.error('❌ Usuario no autenticado');
      alert('No se puede procesar la entrega: usuario no autenticado');
      return;
    }

    try {
      const validPayments = getValidPayments();
      console.log('✅ Pagos válidos:', validPayments);

      const deliveryData = {
        packageId: pkg.id,
        deliveredBy: deliveredBy,
        payments: validPayments.length > 0 ? validPayments : undefined
      };

      console.log('📤 Enviando datos de entrega:', deliveryData);

      await deliverPackage.mutateAsync(deliveryData);

      console.log('✅ Entrega completada, reseteando formulario...');
      
      // Reset form
      setNotes('');
      resetPayments();
      
      // Llamar onSuccess después de un breve delay para permitir que las queries se actualicen
      setTimeout(() => {
        console.log('🏁 Cerrando diálogo...');
        onSuccess();
      }, 500);

    } catch (error) {
      console.error('❌ Error completo en handleSubmit:', error);
    }
  };

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 Actualizando pago:', { index, field, value });
    updatePayment(index, field as any, value, pkg.amount_to_collect || 0);
  };

  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  
  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = (pkg.amount_to_collect || 0) - totalCollected;

  console.log('💰 Estado de pagos:', {
    requiresPayment,
    totalCollected,
    remainingAmount,
    amountToCollect: pkg.amount_to_collect
  });

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

        {/* Payment Warning for uncollected amounts */}
        {requiresPayment && remainingAmount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <p className="text-sm text-orange-700">
                <strong>Atención:</strong> Queda un saldo pendiente de{' '}
                <strong>${remainingAmount.toLocaleString('es-CO')} {pkg.currency || 'COP'}</strong>.
                Puedes registrar los pagos arriba.
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
            type="button"
            disabled={!deliveredBy.trim() || deliverPackage.isPending}
            className="w-full"
            onClick={handleSubmit}
          >
            <Check className="h-4 w-4 mr-2" />
            {deliverPackage.isPending ? 'Entregando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
