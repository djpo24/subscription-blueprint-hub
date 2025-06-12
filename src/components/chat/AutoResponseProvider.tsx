
import { ReactNode } from 'react';
import { useAutoResponse } from '@/hooks/useAutoResponse';

interface AutoResponseProviderProps {
  children: ReactNode;
}

export function AutoResponseProvider({ children }: AutoResponseProviderProps) {
  // Solo inicializar el auto-response hook
  useAutoResponse();
  
  return <>{children}</>;
}
