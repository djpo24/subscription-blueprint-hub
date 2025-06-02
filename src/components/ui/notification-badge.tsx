
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "absolute -top-2 -right-2 h-5 min-w-[20px] rounded-full flex items-center justify-center text-xs font-medium",
        count > 99 && "px-1",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
}
