
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  countryCode: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
}

export const initialCustomerFormData: CustomerFormData = {
  firstName: '',
  lastName: '',
  idNumber: '',
  countryCode: '+57',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  address: ''
};

export const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+57', country: 'CO', flag: '🇨🇴' },
  { code: '+51', country: 'PE', flag: '🇵🇪' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+56', country: 'CL', flag: '🇨🇱' },
  { code: '+58', country: 'VE', flag: '🇻🇪' },
];
