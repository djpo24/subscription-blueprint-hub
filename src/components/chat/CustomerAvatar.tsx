
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface CustomerAvatarProps {
  name?: string;
  customerName?: string; // Agregar compatibilidad con ambos nombres
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomerAvatar({ 
  name, 
  customerName, 
  profileImageUrl, 
  size = 'md' 
}: CustomerAvatarProps) {
  // Usar customerName si está disponible, si no usar name
  const displayName = customerName || name || 'Cliente';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {profileImageUrl && (
        <AvatarImage 
          src={profileImageUrl} 
          alt={displayName}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        {displayName ? getInitials(displayName) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
