
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
  
  // Format with thousands separator (periods)
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
