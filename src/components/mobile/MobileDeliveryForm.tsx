import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { MobilePackageInfo } from './MobilePackageInfo';
import { MobileDeliveryFormFields } from './MobileDeliveryFormFields';
import { MobilePaymentSection } from './MobilePaymentSection';
import { MobileDeliveryActions } from './MobileDeliveryActions';
import { ChatDialog } from '@/components/chat/ChatDialog';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobileDeliveryFormProps {
  package: PackageInDispatch;
  onSuccess: () => void;
  onCancel: () => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function MobileDeliveryForm({ 
  package: pkg, 
  onSuccess, 
  onCancel,
  previewRole,
  disableChat = false
}: MobileDeliveryFormProps) {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | undefined>(undefined);

  const {
    deliveryForm,
    setDeliveryForm,
    paymentData,
    updatePaymentField,
    addPaymentEntry,
    removePaymentEntry,
    getCurrencySymbol,
    isDelivering,
    handleDeliver
  } = useDeliverPackage(pkg, onSuccess);

  const { validateForm } = usePaymentManagement();

  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiresPayment) {
      const validation = validateForm(paymentData.payments, pkg.amount_to_collect || 0);
      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return;
      }
    }

    await handleDeliver(deliveryForm, paymentData.payments);
  };

  const handleOpenChat = (customerId: string, customerName?: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setShowChatDialog(true);
  };

  return (
    <>
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Entregar Encomienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <MobilePackageInfo package={pkg} />
              
              <MobileDeliveryFormFields
                deliveryForm={deliveryForm}
                onUpdateForm={setDeliveryForm}
              />
              
              {requiresPayment && (
                <MobilePaymentSection
                  package={pkg}
                  payments={paymentData.payments}
                  onAddPayment={addPaymentEntry}
                  onUpdatePayment={updatePaymentField}
                  onRemovePayment={removePaymentEntry}
                  getCurrencySymbol={getCurrencySymbol}
                  onOpenChat={handleOpenChat}
                  previewRole={previewRole}
                  disableChat={disableChat}
                />
              )}
              
              <MobileDeliveryActions
                onCancel={onCancel}
                isDelivering={isDelivering}
              />
            </form>
          </CardContent>
        </Card>
      </div>

      <ChatDialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
    </>
  );
}
