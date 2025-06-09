
export const formatAmount = (amount: number, currency?: string) => {
  // Solo formatear el número sin símbolo de moneda
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getCurrencySymbol = (currency?: string) => {
  return currency === 'AWG' ? 'ƒ' : '$';
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${day}/${year}`;
};
