
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface CustomerAvatarProps {
  name: string;
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomerAvatar({ name, profileImageUrl, size = 'md' }: CustomerAvatarProps) {
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
          alt={name}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        {name ? getInitials(name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
