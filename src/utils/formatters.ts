
import { formatNumberWithThousandsSeparator } from './numberFormatter';
import { formatAmountToCollectWithCurrency, type Currency } from './currencyFormatter';

// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  // Format with maximum decimal places, removing trailing zeros, and add thousands separator
  const formattedValue = parseFloat(numValue.toFixed(maxDecimals));
  return formatNumberWithThousandsSeparator(formattedValue);
};

export const formatWeight = (weight: number | null | undefined): string => {
  if (!weight) return '0';
  // Convertir a número y eliminar decimales innecesarios
  const numWeight = Number(weight);
  // Si es un número entero, mostrarlo sin decimales; si no, mostrar máximo 1 decimal
  return numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);
};

export const formatFreight = (freight: number | null | undefined): string => {
  return formatDecimal(freight, 2);
};

export const formatAmountToCollect = (amount: number | null | undefined, currency: Currency = 'COP'): string => {
  return formatAmountToCollectWithCurrency(amount, currency);
};
