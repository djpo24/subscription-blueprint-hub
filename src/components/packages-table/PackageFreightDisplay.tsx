
import { formatFreightCurrency } from '@/utils/currencyFormatter';

interface PackageFreightDisplayProps {
  freight: number | null;
  className?: string;
}

export function PackageFreightDisplay({ freight, className = '' }: PackageFreightDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm">
        {formatFreightCurrency(freight)}
      </span>
      <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-medium">
        COP
      </span>
    </div>
  );
}
