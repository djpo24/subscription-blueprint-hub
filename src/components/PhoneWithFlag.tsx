
import { getCountryFlagByPhone } from '@/utils/countryUtils';

interface PhoneWithFlagProps {
  phone: string;
  className?: string;
}

export function PhoneWithFlag({ phone, className = '' }: PhoneWithFlagProps) {
  const countryFlag = getCountryFlagByPhone(phone);
  
  // Formatear el teléfono para mostrar el número completo con código de país
  const formatPhoneWithCountryCode = (phone: string): string => {
    if (!phone) return '';
    
    // Normalizar el teléfono removiendo espacios y caracteres especiales
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si ya tiene el código de país, devolverlo tal como está
    if (normalizedPhone.startsWith('+')) {
      return normalizedPhone;
    }
    
    // Si no tiene código de país, intentar agregarlo basado en patrones conocidos
    // Esto es un fallback para números que no tengan el código
    if (normalizedPhone.length === 10 && !normalizedPhone.startsWith('+')) {
      // Asumir Colombia para números de 10 dígitos sin código
      return `+57${normalizedPhone}`;
    }
    
    return normalizedPhone;
  };

  const formattedPhone = formatPhoneWithCountryCode(phone);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {countryFlag && <span className="text-sm">{countryFlag}</span>}
      <span>{formattedPhone}</span>
    </div>
  );
}
