import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface FirstPackageBadgeProps {
  className?: string;
}

export function FirstPackageBadge({ className }: FirstPackageBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`text-[10px] bg-gradient-to-r from-blue-50 to-indigo-50 
                 border-blue-200 text-blue-700 font-medium px-1.5 py-0 
                 inline-flex items-center gap-0.5 ${className || ''}`}
    >
      <Sparkles className="h-2.5 w-2.5" />
      <span>Primer Envío</span>
    </Badge>
  );
}
