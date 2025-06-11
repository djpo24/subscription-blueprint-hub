
import { useState, useEffect } from 'react';
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
  const getInitialFormData = (customer: Customer): CustomerFormData => {
    // Extract country code from phone number
    const initialCountryCode = getCountryCodeFromPhone(customer.phone) || '+57';
    const initialPhoneNumber = customer.phone.replace(initialCountryCode, '');
    
    // Split full name into first and last name
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      firstName,
      lastName,
      email: customer.email || '',
      countryCode: initialCountryCode,
      phoneNumber: initialPhoneNumber,
      address: customer.address || '',
      idNumber: customer.id_number || ''
    };
  };

  const [formData, setFormData] = useState<CustomerFormData>(() => 
    getInitialFormData(customer)
  );

  // Update form data when customer changes
  useEffect(() => {
    setFormData(getInitialFormData(customer));
  }, [customer.id, customer.name, customer.phone, customer.email, customer.address, customer.id_number]);

  const updateFormData = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateFormData
  };
}
