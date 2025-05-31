
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
