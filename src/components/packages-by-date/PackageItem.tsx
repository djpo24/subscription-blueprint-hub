
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Package, User, Weight, DollarSign } from 'lucide-react';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { formatCurrency } from '@/utils/currencyFormatter';
import { useIsMobile } from '@/hooks/use-mobile';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageItemProps {
  package: Package;
  onClick: () => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function PackageItem({ 
  package: pkg, 
  onClick, 
  onOpenChat,
  previewRole,
  disableChat = false
}: PackageItemProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'arrived':
        return 'bg-orange-100 text-orange-800';
      case 'bodega':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenChat && !disableChat && userRole?.role === 'admin') {
      onOpenChat(pkg.customer_id, pkg.customers?.name);
    }
  };

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  // Vista móvil compacta con tarjeta
  if (isMobile) {
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

  // Vista desktop (sin cambios)
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
