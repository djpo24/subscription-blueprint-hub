
import { ReactNode } from 'react';

interface RolePreviewProps {
  children: ReactNode;
}

export function RolePreview({ children }: RolePreviewProps) {
  return <div>{children}</div>;
}
