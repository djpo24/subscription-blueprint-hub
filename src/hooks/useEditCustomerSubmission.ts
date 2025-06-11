
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomerFormData } from '@/types/CustomerFormData';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  id_number: string | null;
}

interface ValidationError {
  field: 'phone' | 'idNumber';
  message: string;
}

export function useEditCustomerSubmission(customer: Customer, onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (
    formData: CustomerFormData, 
    validationError: ValidationError | null
  ) => {
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
          email: formData.email.trim() || '',
          phone: fullPhone,
          address: formData.address || null,
          id_number: formData.idNumber.trim() || null
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

  return {
    isLoading,
    handleSubmit
  };
}
