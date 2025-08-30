
export const formatAmount = (amount: number, currency?: string) => {
  if (!amount || isNaN(amount) || !isFinite(amount)) return '0';
  
  try {
    // Solo formatear el número sin símbolo de moneda
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting amount:', error, 'Value:', amount);
    return '0';
  }
};

export const getCurrencySymbol = (currency?: string) => {
  return currency === 'AWG' ? 'ƒ' : '$';
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error, 'Value:', dateString);
    return 'Fecha inválida';
  }
};
