
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
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
}

export function PackageItem({ package: pkg, onClick, onOpenChat }: PackageItemProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('es-CO')}`;
  };

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
    if (onOpenChat) {
      onOpenChat(pkg.customer_id, pkg.customers?.name);
    }
  };

  return (
    <div 
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-lg">{pkg.tracking_number}</span>
            <Badge className={getStatusColor(pkg.status)}>
              {pkg.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Cliente:</span> {pkg.customers?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Peso:</span> {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Flete:</span> {formatCurrency(pkg.freight)}
            </div>
            <div>
              <span className="font-medium">A Cobrar:</span> {formatCurrency(pkg.amount_to_collect)}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Descripción:</span> {pkg.description}
          </div>
        </div>
        
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
      </div>
    </div>
  );
}
