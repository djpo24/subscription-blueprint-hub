
export const getCountryFlagByPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Normalizar el teléfono removiendo espacios y caracteres especiales
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (normalizedPhone.startsWith('+57')) {
    return '🇨🇴'; // Colombia
  } else if (normalizedPhone.startsWith('+5997')) {
    return '🇧🇶'; // Bonaire
  } else if (normalizedPhone.startsWith('+599')) {
    return '🇨🇼'; // Curaçao
  } else if (normalizedPhone.startsWith('+52')) {
    return '🇲🇽'; // México
  } else if (normalizedPhone.startsWith('+1')) {
    return '🇺🇸'; // Estados Unidos
  } else if (normalizedPhone.startsWith('+501')) {
    return '🇧🇿'; // Belice
  }
  
  return ''; // Sin bandera si no coincide con ningún código conocido
};

export const getCountryCodeFromPhone = (phone: string): string => {
  if (!phone) return '';
  
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (normalizedPhone.startsWith('+57')) {
    return '+57';
  } else if (normalizedPhone.startsWith('+5997')) {
    return '+5997';
  } else if (normalizedPhone.startsWith('+599')) {
    return '+599';
  } else if (normalizedPhone.startsWith('+52')) {
    return '+52';
  } else if (normalizedPhone.startsWith('+1')) {
    return '+1';
  } else if (normalizedPhone.startsWith('+501')) {
    return '+501';
  }
  
  return '';
};
