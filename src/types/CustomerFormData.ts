
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export const initialCustomerFormData: CustomerFormData = {
  firstName: '',
  lastName: '',
  idNumber: '',
  countryCode: '+57',
  phoneNumber: '',
  email: '',
  address: ''
};

export const countryCodes = [
  { code: '+57', country: 'CO', flag: '🇨🇴' },
  { code: '+599', country: 'CW', flag: '🇨🇼' },
];
