
export type Currency = 'COP' | 'AWG';

export const formatCurrency = (amount: number, currency: Currency = 'COP'): string => {
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

  return formatters[currency].format(amount);
};

export const formatAmountToCollectWithCurrency = (amount: number | null | undefined, currency: Currency = 'COP'): string => {
  if (!amount || amount === 0) return '---';
  
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

  const formattedAmount = formatters[currency].format(amount);
  const symbol = getCurrencySymbol(currency);
  
  return `${symbol}${formattedAmount} ${currency}`;
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
