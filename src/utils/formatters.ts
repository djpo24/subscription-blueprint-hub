
import { formatNumberWithThousandsSeparator } from './numberFormatter';

// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Return the complete value with thousands separator, no truncation
  return formatNumberWithThousandsSeparator(numValue);
};

export const formatWeight = (weight: number | null | undefined): string => {
  return formatDecimal(weight, 2);
};

export const formatFreight = (freight: number | null | undefined): string => {
  // For freight, we want to show the complete value without decimal truncation
  if (freight === null || freight === undefined) return '0';
  
  const numValue = typeof freight === 'string' ? parseFloat(freight) : freight;
  
  if (isNaN(numValue)) return '0';
  
  // Show complete value with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};

export const formatAmountToCollect = (amount: number | null | undefined): string => {
  // For amount to collect, we want to show the complete value without decimal truncation
  if (amount === null || amount === undefined) return '0';
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue)) return '0';
  
  // Show complete value with thousands separator
  return formatNumberWithThousandsSeparator(numValue);
};
