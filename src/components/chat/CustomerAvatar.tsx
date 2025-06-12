
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { PackageStatusIndicator } from './components/PackageStatusIndicator';
import { useCustomerPackageStatus } from '@/hooks/useCustomerPackageStatus';

interface CustomerAvatarProps {
  customerName: string;
  profileImageUrl?: string | null;
  customerPhone?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatusIndicator?: boolean;
}

export function CustomerAvatar({ 
  customerName, 
  profileImageUrl, 
  customerPhone,
  size = 'md',
  showStatusIndicator = true
}: CustomerAvatarProps) {
  const { data: packageIndicator } = useCustomerPackageStatus(customerPhone || '');
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={profileImageUrl || undefined} alt={customerName} />
        <AvatarFallback className="bg-gray-100 text-gray-600">
          {customerName ? (
            getInitials(customerName)
          ) : (
            <User size={iconSizes[size]} />
          )}
        </AvatarFallback>
      </Avatar>
      
      {/* Indicador de estado de paquetes */}
      {showStatusIndicator && packageIndicator && (
        <div className="absolute -bottom-1 -right-1">
          <PackageStatusIndicator 
            packageIndicator={packageIndicator}
            size={size === 'lg' ? 'md' : 'sm'}
          />
        </div>
      )}
    </div>
  );
}
