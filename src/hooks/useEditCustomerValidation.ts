
import { useCustomerValidation } from '@/hooks/useCustomerValidation';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  id_number: string | null;
}

export function useEditCustomerValidation(customer: Customer) {
  const { 
    isChecking, 
    validationError,
    checkCustomerByPhone, 
    checkCustomerByIdNumber, 
    clearValidationError 
  } = useCustomerValidation();

  const handlePhoneNumberChange = async (value: string, countryCode: string) => {
    if (value.length >= 7) {
      const fullPhone = `${countryCode}${value}`;
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
    // Solo validar si se proporciona un ID y es diferente del actual
    if (value.length >= 6) {
      if (value !== (customer.id_number || '')) {
        await checkCustomerByIdNumber(value);
      } else {
        clearValidationError();
      }
    } else {
      clearValidationError();
    }
  };

  return {
    isChecking,
    validationError,
    handlePhoneNumberChange,
    handleIdNumberChange,
    clearValidationError
  };
}
