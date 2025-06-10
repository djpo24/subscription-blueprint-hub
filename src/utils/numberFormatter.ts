
export const formatNumber = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Add thousands separators (periods)
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseFormattedNumber = (formattedValue: string): string => {
  // Remove periods to get the raw number
  return formattedValue.replace(/\./g, '');
};

// Nueva función para formatear números con separador de miles
export const formatNumberWithThousandsSeparator = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Convert to string preserving all decimals, then format with thousands separator
  const stringValue = numValue.toString();
  
  // Split into integer and decimal parts
  const parts = stringValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  
  // Format integer part with thousands separator (periods)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Return with decimal part if it exists
  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
};
