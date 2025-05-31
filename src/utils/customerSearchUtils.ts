
import { formatPhoneNumber } from './phoneFormatter';
import { formatNumber } from './numberFormatter';
import { getCountryCodeFromPhone } from './countryUtils';

// Helper function to check if email is valid (not empty and not temporary)
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  // List of common temporary email domains
  const tempEmailDomains = [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'maildrop.cc',
    'yopmail.com',
    'exemplo.com',
    'test.com',
    'temp.com',
    'temporal.com'
  ];
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return emailDomain && !tempEmailDomains.includes(emailDomain);
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

// Re-export for convenience
export { formatPhoneNumber, formatNumber };
