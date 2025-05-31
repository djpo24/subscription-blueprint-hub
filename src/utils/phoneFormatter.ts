
export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove all non-digit characters
  const numbers = phone.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Format based on country code
  if (countryCode === '+57') { // Colombia
    // Format: XXX XXX XXXX
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
  } else if (countryCode === '+599') { // Curaçao
    // Format: XXX XXXX
    if (numbers.length <= 3) return numbers;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 7)}`;
  }
  
  // Default formatting for other countries
  return numbers;
};

export const parsePhoneNumber = (formattedPhone: string): string => {
  // Remove all non-digit characters
  return formattedPhone.replace(/\D/g, '');
};
