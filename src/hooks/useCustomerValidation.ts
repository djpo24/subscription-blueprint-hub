
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationError {
  field: 'phone' | 'idNumber';
  message: string;
}

export function useCustomerValidation() {
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  const checkCustomerByPhone = useCallback(async (phone: string): Promise<boolean> => {
    if (!phone.trim()) {
      setValidationError(null);
      return false;
    }
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.error('Error checking phone:', error);
        setValidationError(null);
        return false;
      }

      if (data) {
        setValidationError({
          field: 'phone',
          message: `Este teléfono ya está registrado por ${data.name}`
        });
        return true;
      } else {
        setValidationError(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      setValidationError(null);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkCustomerByIdNumber = useCallback(async (idNumber: string): Promise<boolean> => {
    if (!idNumber.trim()) {
      setValidationError(null);
      return false;
    }
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id_number', idNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking ID number:', error);
        setValidationError(null);
        return false;
      }

      if (data) {
        setValidationError({
          field: 'idNumber',
          message: `Esta cédula ya está registrada por ${data.name}`
        });
        return true;
      } else {
        setValidationError(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking ID number:', error);
      setValidationError(null);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    isChecking,
    validationError,
    checkCustomerByPhone,
    checkCustomerByIdNumber,
    clearValidationError
  };
}
