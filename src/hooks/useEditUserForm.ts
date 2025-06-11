
import { useState, useEffect } from 'react';
import { getCountryCodeFromPhone } from '@/utils/countryUtils';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'employee' | 'traveler';
  is_active: boolean;
}

export function useEditUserForm(user: UserProfile | null) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    countryCode: '+57',
    phoneNumber: '',
    role: 'employee' as 'admin' | 'employee' | 'traveler',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      // Extract country code and phone number from existing phone
      const countryCode = getCountryCodeFromPhone(user.phone || '') || '+57';
      const phoneNumber = user.phone ? user.phone.replace(countryCode, '') : '';
      
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        countryCode,
        phoneNumber,
        role: user.role,
        is_active: user.is_active
      });
    }
  }, [user]);

  const updateFormData = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateFormData
  };
}
