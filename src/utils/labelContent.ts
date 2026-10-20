// Contenido fijo y helpers compartidos por el PDF y la vista previa de la etiqueta
export const LABEL_BRAND = 'ENVIOS OJITO';

export const LABEL_TERMS =
  'Toda encomienda debe ser verificada en el local al momento de la entrega. Una vez entregada, no se aceptan reclamos.';

export const LABEL_OFFICES = [
  { city: 'B/QUILLA', address: 'Calle 45B # 22 - 124', phone: '+5731272717446' },
  { city: 'CURAÇAO', address: 'Jo corsenstraat 48 brievengat', phone: '+599 9 6964306' },
];

const CITY_CODES: Array<{ match: RegExp; code: string; name: string }> = [
  { match: /barranquilla|b\/quilla|\bbaq\b/i, code: 'BAQ', name: 'Barranquilla' },
  { match: /cura[cç]ao|curazao|\bcur\b/i, code: 'CUR', name: 'Curaçao' },
  { match: /bogot[aá]|\bbog\b/i, code: 'BOG', name: 'Bogotá' },
  { match: /aruba|\baua\b/i, code: 'AUA', name: 'Aruba' },
];

// Código corto de 3 letras para la ciudad (BAQ, CUR...). Si no la conoce, usa las 3 primeras letras.
export const getCityCode = (city?: string | null): string => {
  const value = (city || '').trim();
  if (!value) return '---';
  const known = CITY_CODES.find(c => c.match.test(value));
  if (known) return known.code;
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || '---';
};

export const getCityName = (city?: string | null): string => {
  const value = (city || '').trim();
  const known = CITY_CODES.find(c => c.match.test(value));
  return known ? known.name : value;
};

export const getCurrencyName = (currency?: string): string => {
  if (currency === 'AWG') return 'FLORINES (AWG)';
  if (!currency || currency === 'COP') return 'PESOS COLOMBIANOS (COP)';
  return currency;
};
