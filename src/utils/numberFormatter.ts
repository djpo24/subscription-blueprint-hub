
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
  // Add comprehensive logging for debugging
  console.log('formatNumberWithThousandsSeparator called with:', { value, type: typeof value });
  
  if (value === null || value === undefined || value === '') {
    console.log('formatNumberWithThousandsSeparator returning "0" for null/undefined/empty value');
    return '0';
  }
  
  // Convert to number if it's a string
  let numValue: number;
  if (typeof value === 'string') {
    // Check if string is empty or only whitespace
    if (!value.trim()) {
      console.log('formatNumberWithThousandsSeparator returning "0" for empty string');
      return '0';
    }
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    console.log('formatNumberWithThousandsSeparator returning "0" for invalid number:', numValue);
    return '0';
  }
  
  // Ensure we have a valid number before calling toString
  try {
    if (typeof numValue !== 'number') {
      console.error('formatNumberWithThousandsSeparator: numValue is not a number:', numValue);
      return '0';
    }
    
    const stringValue = numValue.toString();
    const result = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    console.log('formatNumberWithThousandsSeparator result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting number:', error, 'Value:', value, 'NumValue:', numValue);
    return '0';
  }
};
