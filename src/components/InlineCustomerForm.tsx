
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CustomerFormData, initialCustomerFormData } from '@/types/CustomerFormData';
import { AddressSelector } from './AddressSelector';
import { Mail, AlertCircle } from 'lucide-react';
import { useCustomerValidation } from '@/hooks/useCustomerValidation';

interface InlineCustomerFormProps {
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
}

export function InlineCustomerForm({ onSuccess, onCancel }: InlineCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustomerFormData>(initialCustomerFormData);
  const { 
    isChecking, 
    validationError,
    checkCustomerByPhone, 
    checkCustomerByIdNumber, 
    clearValidationError 
  } = useCustomerValidation();

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
        email: formData.email || `${Date.now()}@temp.com`,
        phone: fullPhone,
        whatsapp_number: null,
        address: formData.address || null,
        id_number: formData.idNumber || null
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Cliente creado",
        description: `${fullName} ha sido agregado exitosamente`,
      });

      onSuccess(data.id);
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
    
    if (value.length >= 6) { // Validar cuando tenga al menos 6 dígitos
      await checkCustomerByIdNumber(value);
    } else {
      clearValidationError();
    }
  }, [checkCustomerByIdNumber, clearValidationError]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="idNumber">Cédula (Opcional)</Label>
            {validationError?.field === 'idNumber' && (
              <div className="flex items-center gap-2 mt-1 mb-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError.message}</span>
              </div>
            )}
            <div className="relative">
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => handleIdNumberChange(e.target.value)}
                placeholder="Número de identificación"
                className={`mt-1 ${validationError?.field === 'idNumber' ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                disabled={isChecking}
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div>
            {validationError?.field === 'phone' && (
              <div className="flex items-center gap-2 mb-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError.message}</span>
              </div>
            )}
            <PhoneNumberInput
              label="Teléfono"
              id="phone"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryCodeChange={(value) => updateFormData('countryCode', value)}
              onPhoneNumberChange={handlePhoneNumberChange}
              placeholder="Número de teléfono"
              required
              className={validationError?.field === 'phone' ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
          </div>
        </div>

        <div className="space-y-4">
          {!showEmailField ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🟢 Email button clicked');
                setShowEmailField(true);
              }}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Agregar Email (Opcional)
            </Button>
          ) : (
            <div>
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <div>
          <AddressSelector
            value={formData.address}
            onChange={(value) => {
              console.log('🟢 AddressSelector onChange called with value:', value);
              updateFormData('address', value);
            }}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading || !!validationError} 
            className="px-6"
          >
            {isLoading ? 'Creando...' : 'Crear Cliente'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              console.log('🟢 Cancel button clicked');
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }} 
            className="px-6"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
