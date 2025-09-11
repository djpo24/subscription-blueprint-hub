
// Helper function to wait
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to format currency based on package currency with proper format
export const formatCurrencyWithSymbol = (amount: number, currency: string = 'COP'): string => {
  const upperCurrency = currency.toUpperCase();
  
  if (upperCurrency === 'AWG') {
    // Formato: ƒ10 florines (sin separadores de miles para florines)
    return `ƒ${amount} florines`;
  } else {
    // Formato: $30.000 pesos (con separadores de miles para pesos)
    return `$${amount.toLocaleString('es-CO')} pesos`;
  }
};

// Helper function to extract first name only
export const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
};
