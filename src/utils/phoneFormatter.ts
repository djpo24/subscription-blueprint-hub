
export const getMaxPhoneLength = (countryCode: string): number => {
  if (countryCode === '+57') { // Colombia
    return 7;
  } else if (countryCode === '+599') { // Curaçao
    return 8;
  } else if (countryCode === '+52') { // México
    return 7;
  }
  return 10; // Default for other countries
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove all non-digit characters
  const numbers = phone.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Apply length limits based on country
  const maxLength = getMaxPhoneLength(countryCode);
  const limitedNumbers = numbers.slice(0, maxLength);
  
  // Format based on country code
  if (countryCode === '+57') { // Colombia
    // Format: XXX XXXX (max 7 digits)
    if (limitedNumbers.length <= 3) return limitedNumbers;
    return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 7)}`;
  } else if (countryCode === '+599') { // Curaçao
    // Format: XXX XXXXX (max 8 digits)
    if (limitedNumbers.length <= 3) return limitedNumbers;
    return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 8)}`;
  } else if (countryCode === '+52') { // México
    // Format: XXX XXXX (max 7 digits)
    if (limitedNumbers.length <= 3) return limitedNumbers;
    return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3, 7)}`;
  }
  
  // Default formatting for other countries
  return limitedNumbers;
};

export const parsePhoneNumber = (formattedPhone: string): string => {
  // Remove all non-digit characters
  return formattedPhone.replace(/\D/g, '');
};

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  const maxLength = getMaxPhoneLength(countryCode);
  
  // Check if phone number has the correct length for the country
  if (countryCode === '+57') { // Colombia
    return numbers.length === 7;
  } else if (countryCode === '+599') { // Curaçao
    return numbers.length === 7 || numbers.length === 8; // Allow 7 or 8 digits
  } else if (countryCode === '+52') { // México
    return numbers.length === 7;
  }
  
  return numbers.length <= maxLength;
};
