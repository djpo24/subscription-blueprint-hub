
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InlineCustomerFormProps {
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
}

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+57', country: 'CO', flag: '🇨🇴' },
  { code: '+51', country: 'PE', flag: '🇵🇪' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+56', country: 'CL', flag: '🇨🇱' },
  { code: '+58', country: 'VE', flag: '🇻🇪' },
];

export function InlineCustomerForm({ onSuccess, onCancel }: InlineCustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    countryCode: '+57',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    address: ''
  });

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

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <h4 className="font-medium">Crear Nuevo Cliente</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="idNumber">Cédula (Opcional)</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
              placeholder="Número de identificación"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <div className="flex gap-2">
              <Select 
                value={formData.countryCode} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country, index) => (
                    <SelectItem key={`${country.code}-${index}`} value={country.code}>
                      {country.flag} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Número de teléfono"
                className="flex-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
            <div className="flex gap-2">
              <div className="w-24 flex items-center justify-center border rounded-md bg-gray-100 text-sm">
                {formData.countryCode}
              </div>
              <Input
                id="whatsapp"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="Número WhatsApp"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Dirección (Opcional)</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Dirección completa..."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? 'Creando...' : 'Crear Cliente'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} size="sm">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
