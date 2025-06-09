
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCountryCodeFromPhone } from '@/utils/countryUtils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
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
  const { toast } = useToast();
  
  // Extract country code from phone number
  const initialCountryCode = getCountryCodeFromPhone(customer.phone) || '+57';
  const initialPhoneNumber = customer.phone.replace(initialCountryCode, '');
  
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    countryCode: initialCountryCode,
    phoneNumber: initialPhoneNumber,
    address: customer.address || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
      
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          address: formData.address || null
        })
        .eq('id', customer.id);

      if (error) throw error;

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <PhoneNumberInput
              label="Teléfono"
              id="phone"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryCodeChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  countryCode: value,
                  phoneNumber: '' // Clear phone when country changes
                }));
              }}
              onPhoneNumberChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
              placeholder="Número de teléfono"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Dirección completa..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Actualizar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
