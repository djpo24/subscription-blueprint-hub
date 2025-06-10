
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Package, User, Weight, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { PackageItemProps } from './types';

interface PackageItemMobileProps extends PackageItemProps {
  getStatusColor: (status: string) => string;
  handleChatClick: (e: React.MouseEvent) => void;
  canShowChat: boolean;
}

export function PackageItemMobile({ 
  package: pkg, 
  onClick,
  getStatusColor,
  handleChatClick,
  canShowChat
}: PackageItemMobileProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      {/* Header con tracking number y estado */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-bold text-sm text-black">{pkg.tracking_number}</span>
        </div>
        <Badge className={`${getStatusColor(pkg.status)} text-xs px-2 py-0.5`}>
          {pkg.status}
        </Badge>
      </div>

      {/* Información del cliente */}
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-sm text-gray-800 truncate">
          {pkg.customers?.name || 'Cliente no especificado'}
        </span>
      </div>

      {/* Grid de información compacta */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Weight className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Peso</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">
            {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Flete</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">
            {formatCurrency(pkg.freight, 'COP')}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-md p-2 col-span-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-gray-600">A Cobrar</span>
          </div>
          <span className="text-xs font-semibold text-green-700">
            {formatCurrency(pkg.amount_to_collect, pkg.currency || 'COP')}
          </span>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 line-clamp-2">{pkg.description}</p>
      </div>

      {/* Botón de chat si está disponible */}
      {canShowChat && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleChatClick}
            className="h-7 px-2 text-xs flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Chat
          </Button>
        </div>
      )}
    </div>
  );
}
