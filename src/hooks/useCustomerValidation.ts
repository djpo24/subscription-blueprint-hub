
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number: string;
  address: string;
}

export function useCustomerValidation() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkCustomerByPhone = useCallback(async (phone: string): Promise<CustomerData | null> => {
    if (!phone.trim()) return null;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number, address')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.error('Error checking phone:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking phone:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkCustomerByIdNumber = useCallback(async (idNumber: string): Promise<CustomerData | null> => {
    if (!idNumber.trim()) return null;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number, address')
        .eq('id_number', idNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking ID number:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking ID number:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const showCustomerFoundToast = useCallback((customerName: string, field: 'teléfono' | 'cédula') => {
    toast({
      title: "Cliente encontrado",
      description: `${customerName} ya está registrado con este ${field}`,
      variant: "default"
    });
  }, [toast]);

  return {
    isChecking,
    checkCustomerByPhone,
    checkCustomerByIdNumber,
    showCustomerFoundToast
  };
}
