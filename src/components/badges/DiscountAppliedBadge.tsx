import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';
import { formatAmountToCollect } from '@/utils/formatters';

type Currency = 'COP' | 'AWG';

interface DiscountAppliedBadgeProps {
  discountAmount: number;
  currency: Currency;
  className?: string;
}

export function DiscountAppliedBadge({ discountAmount, currency, className }: DiscountAppliedBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`text-[10px] bg-gradient-to-r from-green-50 to-emerald-50 
                 border-green-200 text-green-700 font-medium px-1.5 py-0 
                 inline-flex items-center gap-0.5 ${className || ''}`}
    >
      <Percent className="h-2.5 w-2.5" />
      <span>-{formatAmountToCollect(discountAmount, currency)}</span>
    </Badge>
  );
}
