
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomerFormData, initialCustomerFormData } from '@/types/CustomerFormData';
import { AddressSelector } from './AddressSelector';
import { useCustomerValidation } from '@/hooks/useCustomerValidation';
import { CustomerNameFields } from './CustomerNameFields';
import { CustomerContactFields } from './CustomerContactFields';
import { CustomerEmailField } from './CustomerEmailField';
import { CustomerFormActions } from './CustomerFormActions';

interface InlineCustomerFormProps {
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
  initialPhone?: {
    countryCode: string;
    phoneNumber: string;
  };
}

export function InlineCustomerForm({ 
  onSuccess, 
  onCancel, 
  initialPhone 
}: InlineCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const { toast } = useToast();
  
  // Inicializar formData con datos del teléfono si se proporcionan
  const [formData, setFormData] = useState<CustomerFormData>(() => ({
    ...initialCustomerFormData,
    countryCode: initialPhone?.countryCode || '+57',
    phoneNumber: initialPhone?.phoneNumber || ''
  }));

  const { 
    isChecking, 
    validationError,
    checkCustomerByPhone, 
    checkCustomerByIdNumber, 
    clearValidationError 
  } = useCustomerValidation();

  // Validar teléfono inicial si se proporciona
  useEffect(() => {
    if (initialPhone?.phoneNumber && initialPhone.phoneNumber.length >= 7) {
      const fullPhone = `${initialPhone.countryCode}${initialPhone.phoneNumber}`;
      checkCustomerByPhone(fullPhone);
    }
  }, [initialPhone, checkCustomerByPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔴 InlineCustomerForm handleSubmit called!');
    e.preventDefault();
    e.stopPropagation();

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

      const customerData = {
        name: fullName,
        email: formData.email.trim() || '', // Permitir email vacío
        phone: fullPhone,
        whatsapp_number: null,
        address: formData.address || null,
        id_number: formData.idNumber.trim() || null // Permitir id_number vacío
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select('id')
        .single();

      if (error) throw error;

      if (data) {
        toast({
          title: "Cliente creado",
          description: `${fullName} ha sido agregado exitosamente`,
        });

        onSuccess(data.id);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof CustomerFormData, value: string) => {
    console.log('🟡 updateFormData called for field:', field, 'with value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumberChange = useCallback(async (value: string) => {
    updateFormData('phoneNumber', value);
    
    if (value.length >= 7) { // Validar cuando tenga al menos 7 dígitos
      const fullPhone = `${formData.countryCode}${value}`;
      await checkCustomerByPhone(fullPhone);
    } else {
      clearValidationError();
    }
  }, [formData.countryCode, checkCustomerByPhone, clearValidationError]);

  const handleIdNumberChange = useCallback(async (value: string) => {
    updateFormData('idNumber', value);
    
    // Solo validar si se proporciona un ID number
    if (value.trim() && value.length >= 6) {
      await checkCustomerByIdNumber(value);
    } else {
      clearValidationError();
    }
  }, [checkCustomerByIdNumber, clearValidationError]);

  return (
    <div className="space-y-6">
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
          onCountryCodeChange={(value) => updateFormData('countryCode', value)}
          onPhoneNumberChange={handlePhoneNumberChange}
          phoneReadOnly={!!initialPhone} // Hacer el teléfono de solo lectura si viene pre-cargado
        />

        <CustomerEmailField
          email={formData.email}
          showEmailField={showEmailField}
          onEmailChange={(value) => updateFormData('email', value)}
          onToggleEmailField={() => {
            console.log('🟢 Email button clicked');
            setShowEmailField(true);
          }}
        />

        <div>
          <AddressSelector
            value={formData.address}
            onChange={(value) => {
              console.log('🟢 AddressSelector onChange called with value:', value);
              updateFormData('address', value);
            }}
          />
        </div>

        <CustomerFormActions
          isLoading={isLoading}
          hasValidationError={!!validationError}
          onCancel={onCancel}
        />
      </form>
    </div>
  );
}
