
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
  if (value === null || value === undefined || value === '') return '0';
  
  // Convert to number if it's a string
  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue) || !isFinite(numValue)) return '0';
  
  // Format with thousands separator (periods) - ensure we have a valid number before calling toString
  try {
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } catch (error) {
    console.error('Error formatting number:', error, 'Value:', value);
    return '0';
  }
};
