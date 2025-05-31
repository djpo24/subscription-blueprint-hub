
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CustomerFormData, initialCustomerFormData } from '@/types/CustomerFormData';
import { AddressSelector } from './AddressSelector';
import { Mail } from 'lucide-react';

interface InlineCustomerFormProps {
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
}

export function InlineCustomerForm({ onSuccess, onCancel }: InlineCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustomerFormData>(initialCustomerFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔴 InlineCustomerForm handleSubmit called!');
    console.log('🔴 Event type:', e.type);
    console.log('🔴 Event target:', e.target);
    console.log('🔴 Event currentTarget:', e.currentTarget);
    console.log('🔴 Stack trace:', new Error().stack);
    
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;

      const customerData = {
        name: fullName,
        email: formData.email || `${Date.now()}@temp.com`, // Temporary email if not provided
        phone: fullPhone,
        whatsapp_number: null,
        address: formData.address || null
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

  return (
    <div className="space-y-6">
      {/* Address selector OUTSIDE the form */}
      <div>
        <AddressSelector
          value={formData.address}
          onChange={(value) => {
            console.log('🟢 AddressSelector onChange called with value:', value);
            updateFormData('address', value);
          }}
        />
      </div>

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
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => updateFormData('idNumber', e.target.value)}
              placeholder="Número de identificación"
              className="mt-1"
            />
          </div>

          <div>
            <PhoneNumberInput
              label="Teléfono"
              id="phone"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryCodeChange={(value) => updateFormData('countryCode', value)}
              onPhoneNumberChange={(value) => updateFormData('phoneNumber', value)}
              placeholder="Número de teléfono"
              required
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

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="px-6">
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
