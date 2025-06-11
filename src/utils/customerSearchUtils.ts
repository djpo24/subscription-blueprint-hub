
import { formatPhoneNumber } from './phoneFormatter';
import { formatNumber } from './numberFormatter';
import { getCountryCodeFromPhone } from './countryUtils';

// Helper function to check if email is valid (not empty)
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  // Verificación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Helper function to format phone for display
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  const countryCode = getCountryCodeFromPhone(phone);
  
  if (countryCode === '+57') {
    return formatPhoneNumber(phone.substring(3), '+57');
  } else if (countryCode === '+599') {
    return formatPhoneNumber(phone.substring(4), '+599');
  }
  
  return phone;
};

// Helper function to check if ID number is valid (not empty)
export const isValidIdNumber = (idNumber: string | null): boolean => {
  return !!(idNumber && idNumber.trim() !== '');
};

// Re-export for convenience
export { formatPhoneNumber, formatNumber };
