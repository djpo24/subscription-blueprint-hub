
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditCustomerForm } from '@/hooks/useEditCustomerForm';
import { useEditCustomerSubmission } from '@/hooks/useEditCustomerSubmission';
import { useEditCustomerValidation } from '@/hooks/useEditCustomerValidation';
import { CustomerNameFields } from '@/components/CustomerNameFields';
import { CustomerContactFields } from '@/components/CustomerContactFields';
import { CustomerEmailField } from '@/components/CustomerEmailField';
import { AddressSelector } from '@/components/AddressSelector';
import { CustomerFormActions } from '@/components/CustomerFormActions';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  id_number: string | null;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSuccess: () => void;
}

export function EditCustomerDialog({ 
  open, 
  onOpenChange, 
  customer, 
  onSuccess 
}: EditCustomerDialogProps) {
  const [showEmailField, setShowEmailField] = useState(!!customer.email);
  
  const { formData, updateFormData } = useEditCustomerForm(customer);
  const { isLoading, handleSubmit } = useEditCustomerSubmission(customer, onSuccess);
  const { 
    isChecking, 
    validationError, 
    handlePhoneNumberChange, 
    handleIdNumberChange 
  } = useEditCustomerValidation(customer);

  const onPhoneNumberChange = async (value: string) => {
    updateFormData('phoneNumber', value);
    await handlePhoneNumberChange(value, formData.countryCode);
  };

  const onIdNumberChangeHandler = async (value: string) => {
    updateFormData('idNumber', value);
    await handleIdNumberChange(value);
  };

  const handleCountryCodeChange = (value: string) => {
    updateFormData('countryCode', value);
    // Clear phone number when country changes to avoid validation issues
    if (formData.phoneNumber) {
      updateFormData('phoneNumber', '');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData, validationError);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <CustomerNameFields
                firstName={formData.firstName}
                lastName={formData.lastName}
                onFirstNameChange={(value) => updateFormData('firstName', value)}
                onLastNameChange={(value) => updateFormData('lastName', value)}
              />

              <CustomerContactFields
                idNumber={formData.idNumber}
                countryCode={formData.countryCode}
                phoneNumber={formData.phoneNumber}
                validationError={validationError?.message || null}
                isChecking={isChecking}
                onIdNumberChange={onIdNumberChangeHandler}
                onCountryCodeChange={handleCountryCodeChange}
                onPhoneNumberChange={onPhoneNumberChange}
              />

              <CustomerEmailField
                email={formData.email}
                showEmailField={showEmailField}
                onEmailChange={(value) => updateFormData('email', value)}
                onToggleEmailField={() => setShowEmailField(true)}
              />

              <div>
                <AddressSelector
                  value={formData.address}
                  onChange={(value) => updateFormData('address', value)}
                />
              </div>

              <CustomerFormActions
                isLoading={isLoading}
                hasValidationError={!!validationError}
                onCancel={handleCancel}
                submitText="Actualizar Cliente"
                loadingText="Actualizando..."
              />
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
