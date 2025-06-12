
import { Badge } from '@/components/ui/badge';
import { Bot, Zap } from 'lucide-react';
import { useAutoResponseDetection } from '@/hooks/useAutoResponseDetection';

export function AutoResponseIndicator() {
  const { isActive } = useAutoResponseDetection();

  if (!isActive) {
    return null;
  }

  return (
    <Badge variant="default" className="flex items-center gap-1 animate-pulse">
      <Bot className="h-3 w-3" />
      <Zap className="h-3 w-3" />
      <span className="text-xs">Auto-respuesta activa</span>
    </Badge>
  );
}
