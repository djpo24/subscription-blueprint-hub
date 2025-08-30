
import { formatNumberWithThousandsSeparator } from './numberFormatter';
import { formatAmountToCollectWithCurrency, type Currency } from './currencyFormatter';

// Utility functions for formatting numbers
export const formatDecimal = (value: number | null | undefined, maxDecimals: number = 2): string => {
  console.log('formatDecimal called with:', { value, type: typeof value, maxDecimals });
  
  if (value === null || value === undefined) {
    console.log('formatDecimal returning "0" for null/undefined');
    return '0';
  }
  
  // Convert to number if it's a string
  let numValue: number;
  if (typeof value === 'string') {
    // Check if string is empty or only whitespace
    if (!value.trim()) {
      console.log('formatDecimal returning "0" for empty string');
      return '0';
    }
    numValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numValue = value;
  } else {
    console.log('formatDecimal returning "0" for invalid type:', typeof value);
    return '0';
  }
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    console.log('formatDecimal returning "0" for invalid number:', numValue);
    return '0';
  }
  
  try {
    // Ensure maxDecimals is a valid number
    const validMaxDecimals = typeof maxDecimals === 'number' && !isNaN(maxDecimals) ? maxDecimals : 2;
    
    // Format with maximum decimal places, removing trailing zeros, and add thousands separator
    const formattedValue = parseFloat(numValue.toFixed(validMaxDecimals));
    const result = formatNumberWithThousandsSeparator(formattedValue);
    console.log('formatDecimal result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting decimal:', error, 'Value:', value);
    return '0';
  }
};

export const formatWeight = (weight: number | null | undefined): string => {
  console.log('formatWeight called with:', { weight, type: typeof weight });
  
  if (!weight || weight === null || weight === undefined) {
    console.log('formatWeight returning "0" for falsy value');
    return '0';
  }
  
  try {
    // Convertir a número y eliminar decimales innecesarios
    let numWeight: number;
    if (typeof weight === 'string') {
      if (!weight.trim()) {
        console.log('formatWeight returning "0" for empty string');
        return '0';
      }
      numWeight = parseFloat(weight);
    } else {
      numWeight = Number(weight);
    }
    
    if (isNaN(numWeight) || !isFinite(numWeight)) {
      console.log('formatWeight returning "0" for invalid number:', numWeight);
      return '0';
    }
    
    // Si es un número entero, mostrarlo sin decimales; si no, mostrar máximo 1 decimal
    const result = numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);
    console.log('formatWeight result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting weight:', error, 'Value:', weight);
    return '0';
  }
};

export const formatFreight = (freight: number | null | undefined): string => {
  console.log('formatFreight called with:', { freight, type: typeof freight });
  return formatDecimal(freight, 2);
};

export const formatAmountToCollect = (amount: number | null | undefined, currency: Currency = 'COP'): string => {
  console.log('formatAmountToCollect called with:', { amount, type: typeof amount, currency });
  return formatAmountToCollectWithCurrency(amount, currency);
};
