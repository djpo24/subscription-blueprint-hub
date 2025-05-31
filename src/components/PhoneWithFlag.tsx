
import { getCountryFlagByPhone } from '@/utils/countryUtils';
import { formatPhoneForDisplay } from '@/utils/customerSearchUtils';

interface PhoneWithFlagProps {
  phone: string;
  className?: string;
}

export function PhoneWithFlag({ phone, className = '' }: PhoneWithFlagProps) {
  const countryFlag = getCountryFlagByPhone(phone);
  const formattedPhone = formatPhoneForDisplay(phone);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {countryFlag && <span className="text-sm">{countryFlag}</span>}
      <span>{formattedPhone}</span>
    </div>
  );
}
