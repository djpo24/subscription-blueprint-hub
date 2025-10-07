export const formatWeight = (weight: number | null): string => {
  if (weight === null || weight === undefined) return '0';
  return weight.toFixed(2);
};

export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '$0';
  return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
