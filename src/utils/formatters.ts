
// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Format with maximum decimal places, removing trailing zeros
  return parseFloat(numValue.toFixed(maxDecimals)).toString();
};

export const formatWeight = (weight: number | null | undefined): string => {
  return formatDecimal(weight, 2);
};

export const formatFreight = (freight: number | null | undefined): string => {
  return formatDecimal(freight, 2);
};

export const formatAmountToCollect = (amount: number | null | undefined): string => {
  return formatDecimal(amount, 2);
};
