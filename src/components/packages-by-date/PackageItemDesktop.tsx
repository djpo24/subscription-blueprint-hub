
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { PackageItemProps } from './types';

interface PackageItemDesktopProps extends PackageItemProps {
  getStatusColor: (status: string) => string;
  handleChatClick: (e: React.MouseEvent) => void;
  canShowChat: boolean;
}

export function PackageItemDesktop({ 
  package: pkg, 
  onClick,
  getStatusColor,
  handleChatClick,
  canShowChat
}: PackageItemDesktopProps) {
  return (
    <div 
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-lg">{pkg.customers?.name || 'Cliente no especificado'}</span>
              <Badge className={getStatusColor(pkg.status)}>
                {pkg.status}
              </Badge>
            </div>
            <span className="font-semibold text-lg">{pkg.tracking_number}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Peso:</span> {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Flete:</span> {formatCurrency(pkg.freight, 'COP')}
            </div>
            <div>
              <span className="font-medium">A Cobrar:</span> {formatCurrency(pkg.amount_to_collect, pkg.currency || 'COP')}
            </div>
            <div>
              <span className="font-medium">Moneda:</span> {pkg.currency || 'COP'}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Descripción:</span> {pkg.description}
          </div>
        </div>
        
        {canShowChat && (
          <div className="ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatClick}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
