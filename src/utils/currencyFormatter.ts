
type Currency = 'COP' | 'AWG';

export const formatCurrency = (value: number | null, currency: Currency) => {
  if (!value) return 'N/A';
  
  const symbol = currency === 'AWG' ? 'ƒ' : '$';
  return `${symbol}${value.toLocaleString('es-CO')} ${currency}`;
};

export const getCurrencySymbol = (currency: Currency) => {
  return currency === 'AWG' ? 'ƒ' : '$';
};

export const getCurrencyLabel = (currency: Currency) => {
  const labels = {
    'AWG': 'Florín Arubano (AWG)',
    'COP': 'Peso Colombiano (COP)'
  };
  return labels[currency];
};
