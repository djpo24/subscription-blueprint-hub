
type Currency = 'COP' | 'AWG';

export const formatCurrency = (value: number | null, currency: Currency) => {
  if (!value) return 'N/A';
  
  const symbol = currency === 'AWG' ? 'ƒ' : '$';
  return `${symbol}${value.toLocaleString('es-CO')} ${currency}`;
};

// Formato específico para flete (siempre COP)
export const formatFreightCurrency = (value: number | null) => {
  if (!value) return 'N/A';
  return `$${value.toLocaleString('es-CO')} COP`;
};

// Formato específico para monto a cobrar (puede ser COP o AWG)
export const formatAmountToCollect = (value: number | null, currency: Currency) => {
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

// Etiqueta específica para el flete
export const getFreightCurrencyLabel = () => {
  return 'Peso Colombiano (COP) - Flete';
};
