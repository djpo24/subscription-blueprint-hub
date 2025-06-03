
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface CustomerAvatarProps {
  customerName?: string;
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomerAvatar({ 
  customerName, 
  profileImageUrl, 
  size = 'md' 
}: CustomerAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-16 w-16'
  };

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  console.log('CustomerAvatar rendering - Name:', customerName, 'Image URL:', profileImageUrl);

  return (
    <Avatar className={sizeClasses[size]}>
      {profileImageUrl && (
        <AvatarImage 
          src={profileImageUrl} 
          alt={customerName || 'Cliente'}
          onLoad={() => console.log('Avatar image loaded successfully:', profileImageUrl)}
          onError={(e) => {
            console.log('Avatar image failed to load:', profileImageUrl);
            console.error('Image error:', e);
          }}
          // Añadir crossOrigin para evitar problemas de CORS con imágenes de WhatsApp
          crossOrigin="anonymous"
        />
      )}
      <AvatarFallback className="bg-blue-100 text-blue-600">
        {customerName ? getInitials(customerName) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
