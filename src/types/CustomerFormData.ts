
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  idNumber: string;
}

export const initialCustomerFormData: CustomerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  countryCode: '+57',
  phoneNumber: '',
  address: '',
  idNumber: ''
};

export const countryCodes = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+599', flag: '🇨🇼', name: 'Curaçao' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' }
];
