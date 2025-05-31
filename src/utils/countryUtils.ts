
export const getCountryFlagByPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Normalizar el teléfono removiendo espacios y caracteres especiales
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (normalizedPhone.startsWith('+57')) {
    return '🇨🇴'; // Colombia
  } else if (normalizedPhone.startsWith('+599')) {
    return '🇨🇼'; // Curaçao
  }
  
  return ''; // Sin bandera si no coincide con ningún código conocido
};

export const getCountryCodeFromPhone = (phone: string): string => {
  if (!phone) return '';
  
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (normalizedPhone.startsWith('+57')) {
    return '+57';
  } else if (normalizedPhone.startsWith('+599')) {
    return '+599';
  }
  
  return '';
};
