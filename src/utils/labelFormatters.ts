
export const formatAmount = (amount: number, currency?: string) => {
  console.log('formatAmount called with:', { amount, type: typeof amount, currency });
  
  if (!amount || isNaN(amount) || !isFinite(amount)) {
    console.log('formatAmount returning "0" for invalid amount');
    return '0';
  }
  
  try {
    // Ensure amount is actually a number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      console.log('formatAmount returning "0" for invalid converted number:', numAmount);
      return '0';
    }
    
    // Solo formatear el número sin símbolo de moneda
    const result = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
    
    console.log('formatAmount result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting amount:', error, 'Value:', amount);
    return '0';
  }
};

export const getCurrencySymbol = (currency?: string) => {
  return currency === 'AWG' ? 'ƒ' : '$';
};

export const formatDate = (dateString: string) => {
  console.log('formatDate called with:', { dateString, type: typeof dateString });
  
  if (!dateString) {
    console.log('formatDate returning default for empty dateString');
    return 'Fecha no disponible';
  }
  
  try {
    // Ensure dateString is actually a string
    const stringDate = String(dateString);
    const date = new Date(stringDate);
    
    if (isNaN(date.getTime())) {
      console.log('formatDate returning "Fecha inválida" for invalid date:', stringDate);
      return 'Fecha inválida';
    }
    
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    const result = `${month} ${day}/${year}`;
    
    console.log('formatDate result:', result);
    return result;
  } catch (error) {
    console.error('Error formatting date:', error, 'Value:', dateString);
    return 'Fecha inválida';
  }
};
