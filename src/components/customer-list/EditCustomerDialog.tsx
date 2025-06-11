
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditCustomerForm } from '@/hooks/useEditCustomerForm';
import { useEditCustomerSubmission } from '@/hooks/useEditCustomerSubmission';
import { useEditCustomerValidation } from '@/hooks/useEditCustomerValidation';
import { EditCustomerForm } from './EditCustomerForm';

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
  const [showEmailField, setShowEmailField] = useState(true);
  
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
          <form onSubmit={onSubmit} className="space-y-6">
            <EditCustomerForm
              formData={formData}
              validationError={validationError}
              isChecking={isChecking}
              showEmailField={showEmailField}
              onFormDataChange={updateFormData}
              onPhoneNumberChange={onPhoneNumberChange}
              onIdNumberChange={onIdNumberChangeHandler}
              onCountryCodeChange={handleCountryCodeChange}
              onToggleEmailField={() => setShowEmailField(true)}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !!validationError}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Cliente'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
