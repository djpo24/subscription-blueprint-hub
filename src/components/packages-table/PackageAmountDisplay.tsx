
import { formatAmountToCollect } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface PackageAmountDisplayProps {
  amount: number | null;
  currency: Currency;
  className?: string;
}

export function PackageAmountDisplay({ amount, currency, className = '' }: PackageAmountDisplayProps) {
  const badgeColor = currency === 'AWG' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm">
        {formatAmountToCollect(amount, currency)}
      </span>
      <span className={`text-xs ${badgeColor} px-1 py-0.5 rounded font-medium`}>
        {currency}
      </span>
    </div>
  );
}
