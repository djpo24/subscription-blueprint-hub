
import { formatNumberWithThousandsSeparator } from './numberFormatter';

// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Don't use toFixed to avoid rounding, just format with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};

export const formatWeight = (weight: number | null | undefined): string => {
  if (weight === null || weight === undefined) return '0';
  
  const numValue = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (isNaN(numValue)) return '0';
  
  // Show complete value with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};

export const formatFreight = (freight: number | null | undefined): string => {
  if (freight === null || freight === undefined) return '0';
  
  const numValue = typeof freight === 'string' ? parseFloat(freight) : freight;
  
  if (isNaN(numValue)) return '0';
  
  // Show complete value with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};

export const formatAmountToCollect = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '0';
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) return '0';
  
  // Show complete value with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};
