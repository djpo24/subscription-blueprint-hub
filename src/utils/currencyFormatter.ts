
export type Currency = 'COP' | 'AWG';

export const formatCurrency = (amount: number, currency: Currency = 'COP'): string => {
  console.log('formatCurrency called with:', { amount, type: typeof amount, currency });
  
  // Add safety check for amount
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    console.log('formatCurrency returning formatted "0" for invalid amount');
    const formatters = {
      COP: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      AWG: new Intl.NumberFormat('en-AW', {
        style: 'currency',
        currency: 'AWG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    };
    return formatters[currency].format(0);
  }
  
  const formatters = {
    COP: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    AWG: new Intl.NumberFormat('en-AW', {
      style: 'currency',
      currency: 'AWG',
      minimumFractionDigits: 0, // Cambiado a 0 decimales
      maximumFractionDigits: 0, // Cambiado a 0 decimales
    }),
  };

  try {
    const result = formatters[currency].format(amount);
    console.log('formatCurrency result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting currency:', error, 'Amount:', amount, 'Currency:', currency);
    return formatters[currency].format(0);
  }
};

export const formatAmountToCollectWithCurrency = (amount: number | null | undefined, currency: Currency = 'COP'): string => {
  console.log('formatAmountToCollectWithCurrency called with:', { amount, type: typeof amount, currency });
  
  if (!amount || amount === 0 || amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    console.log('formatAmountToCollectWithCurrency returning "---" for invalid amount');
    return '---';
  }
  
  const formatters = {
    COP: new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    AWG: new Intl.NumberFormat('en-AW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };

  try {
    const formattedAmount = formatters[currency].format(amount);
    const symbol = getCurrencySymbol(currency);
    const result = `${symbol}${formattedAmount} ${currency}`;
    console.log('formatAmountToCollectWithCurrency result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting amount to collect with currency:', error, 'Amount:', amount, 'Currency:', currency);
    return '---';
  }
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols = {
    COP: '$',
    AWG: 'ƒ',
  };
  
  return symbols[currency];
};

export const parseCurrencyString = (currencyStr: string | null | undefined): Currency => {
  if (!currencyStr) return 'COP';
  const normalized = currencyStr.toUpperCase();
  return (normalized === 'AWG' || normalized === 'COP') ? normalized as Currency : 'COP';
};
