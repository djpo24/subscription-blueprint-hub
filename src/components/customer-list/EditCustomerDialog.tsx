
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCountryCodeFromPhone } from '@/utils/countryUtils';
import { CustomerNameFields } from '@/components/CustomerNameFields';
import { CustomerContactFields } from '@/components/CustomerContactFields';
import { CustomerEmailField } from '@/components/CustomerEmailField';
import { useCustomerValidation } from '@/hooks/useCustomerValidation';
import { CustomerFormData } from '@/types/CustomerFormData';
import { AlertCircle } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(true);
  const { toast } = useToast();
  
  // Extract country code from phone number
  const initialCountryCode = getCountryCodeFromPhone(customer.phone) || '+57';
  const initialPhoneNumber = customer.phone.replace(initialCountryCode, '');
  
  // Split full name into first and last name
  const nameParts = customer.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName,
    lastName,
    email: customer.email,
    countryCode: initialCountryCode,
    phoneNumber: initialPhoneNumber,
    address: customer.address || '',
    idNumber: customer.id_number || ''
  });

  const { 
    isChecking, 
    validationError,
    checkCustomerByPhone, 
    checkCustomerByIdNumber, 
    clearValidationError 
  } = useCustomerValidation();

  const updateFormData = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumberChange = async (value: string) => {
    updateFormData('phoneNumber', value);
    
    if (value.length >= 7) {
      const fullPhone = `${formData.countryCode}${value}`;
      // Only check if phone is different from current customer's phone
      if (fullPhone !== customer.phone) {
        await checkCustomerByPhone(fullPhone);
      } else {
        clearValidationError();
      }
    } else {
      clearValidationError();
    }
  };

  const handleIdNumberChange = async (value: string) => {
    updateFormData('idNumber', value);
    
    if (value.length >= 6) {
      // Only check if ID is different from current customer's ID
      if (value !== customer.id_number) {
        await checkCustomerByIdNumber(value);
      } else {
        clearValidationError();
      }
    } else {
      clearValidationError();
    }
  };

  const handleCountryCodeChange = (value: string) => {
    updateFormData('countryCode', value);
    // Clear phone number when country changes to avoid validation issues
    if (formData.phoneNumber) {
      updateFormData('phoneNumber', '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // No permitir envío si hay errores de validación
    if (validationError) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      
      const { error } = await supabase
        .from('customers')
        .update({
          name: fullName,
          email: formData.email,
          phone: fullPhone,
          address: formData.address || null,
          id_number: formData.idNumber || null
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Cliente actualizado",
        description: `${fullName} ha sido actualizado exitosamente`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
              validationError={validationError}
              isChecking={isChecking}
              onIdNumberChange={handleIdNumberChange}
              onCountryCodeChange={handleCountryCodeChange}
              onPhoneNumberChange={handlePhoneNumberChange}
            />

            <CustomerEmailField
              email={formData.email}
              showEmailField={showEmailField}
              onEmailChange={(value) => updateFormData('email', value)}
              onToggleEmailField={() => setShowEmailField(true)}
            />

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Dirección completa..."
                rows={3}
                className="mt-1"
              />
            </div>

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
