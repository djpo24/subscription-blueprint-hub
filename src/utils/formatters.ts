
import { formatNumberWithThousandsSeparator } from './numberFormatter';
import { formatAmountToCollectWithCurrency, type Currency } from './currencyFormatter';

// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '0';
  
  // Convert to number if it's a string
  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue) || !isFinite(numValue)) return '0';
  
  try {
    // Format with maximum decimal places, removing trailing zeros, and add thousands separator
    const formattedValue = parseFloat(numValue.toFixed(maxDecimals));
    return formatNumberWithThousandsSeparator(formattedValue);
  } catch (error) {
    console.error('Error formatting decimal:', error, 'Value:', value);
    return '0';
  }
};

export const formatWeight = (weight: number | null | undefined): string => {
  if (!weight || weight === null || weight === undefined) return '0';
  
  try {
    // Convertir a número y eliminar decimales innecesarios
    const numWeight = Number(weight);
    if (isNaN(numWeight) || !isFinite(numWeight)) return '0';
    
    // Si es un número entero, mostrarlo sin decimales; si no, mostrar máximo 1 decimal
    return numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);
  } catch (error) {
    console.error('Error formatting weight:', error, 'Value:', weight);
    return '0';
  }
};

export const formatFreight = (freight: number | null | undefined): string => {
  return formatDecimal(freight, 2);
};

export const formatAmountToCollect = (amount: number | null | undefined, currency: Currency = 'COP'): string => {
  return formatAmountToCollectWithCurrency(amount, currency);
};
