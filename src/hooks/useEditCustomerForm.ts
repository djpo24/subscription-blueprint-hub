
import { useState } from 'react';
import { CustomerFormData } from '@/types/CustomerFormData';
import { getCountryCodeFromPhone } from '@/utils/countryUtils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  id_number: string | null;
}

export function useEditCustomerForm(customer: Customer) {
  // Extract country code from phone number
  const initialCountryCode = getCountryCodeFromPhone(customer.phone) || '+57';
  const initialPhoneNumber = customer.phone.replace(initialCountryCode, '');
  
  // Split full name into first and last name
  const nameParts = customer.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName,
    lastName,
    email: customer.email || '',
    countryCode: initialCountryCode,
    phoneNumber: initialPhoneNumber,
    address: customer.address || '',
    idNumber: customer.id_number || ''
  });

  const updateFormData = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateFormData
  };
}
