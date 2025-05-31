
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CustomerFormData, initialCustomerFormData } from '@/types/CustomerFormData';

interface InlineCustomerFormProps {
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
}

export function InlineCustomerForm({ onSuccess, onCancel }: InlineCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustomerFormData>(initialCustomerFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      const fullWhatsApp = formData.whatsappNumber ? `${formData.countryCode}${formData.whatsappNumber}` : null;

      const customerData = {
        name: fullName,
        email: formData.email,
        phone: fullPhone,
        whatsapp_number: fullWhatsApp,
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full border rounded-lg p-6 space-y-6 bg-gray-50">
      <h4 className="font-medium text-lg">Crear Nuevo Cliente</h4>
      
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <PhoneNumberInput
            label="WhatsApp (Opcional)"
            id="whatsapp"
            countryCode={formData.countryCode}
            phoneNumber={formData.whatsappNumber}
            onCountryCodeChange={(value) => updateFormData('countryCode', value)}
            onPhoneNumberChange={(value) => updateFormData('whatsappNumber', value)}
            placeholder="Número WhatsApp"
            showCountryCodeSelector={false}
          />
        </div>

        <div>
          <Label htmlFor="address">Dirección (Opcional)</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            placeholder="Dirección completa..."
            className="mt-1"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="px-6">
            {isLoading ? 'Creando...' : 'Crear Cliente'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
