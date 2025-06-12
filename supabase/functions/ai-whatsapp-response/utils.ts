
// Helper function to wait
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to format currency based on package currency
export const formatCurrencyWithSymbol = (amount: number, currency: string = 'COP'): string => {
  const upperCurrency = currency.toUpperCase();
  
  if (upperCurrency === 'AWG') {
    return `ƒ${amount.toLocaleString()} florines`;
  } else {
    // Default to COP (Colombian Pesos)
    return `$${amount.toLocaleString()} pesos`;
  }
};

// Helper function to extract first name only
export const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  return fullName.trim().split(' ')[0];
};
