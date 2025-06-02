
import { Badge } from '@/components/ui/badge';
import { Package, Weight, Truck, DollarSign } from 'lucide-react';

interface PackageData {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  status: string;
  origin: string;
  destination: string;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface PackageItemProps {
  package: PackageData;
  onClick: (pkg: PackageData) => void;
}

export function PackageItem({ package: pkg, onClick }: PackageItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "arrived":
        return "bg-purple-100 text-purple-800";
      case "recibido":
        return "bg-yellow-100 text-yellow-800";
      case "bodega":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "in_transit":
        return "En Tránsito";
      case "arrived":
        return "Llegó";
      case "recibido":
        return "Recibido";
      case "bodega":
        return "Bodega";
      default:
        return status;
    }
  };

  const formatDescription = (description: string) => {
    if (!description) return '';
    
    const items = description.split(',').map(item => item.trim());
    
    if (items.length <= 2) {
      return items.join(', ');
    }
    
    // Si hay más de 2 elementos, mostrar los primeros 2 + primeros 5 caracteres del tercero + "..."
    const firstTwo = items.slice(0, 2).join(', ');
    const thirdItemPreview = items[2].substring(0, 5) + '...';
    
    return `${firstTwo}, ${thirdItemPreview}`;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const handleClick = () => {
    if (pkg.status !== 'delivered') {
      onClick(pkg);
    }
  };

  return (
    <div
      className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        pkg.status !== 'delivered' ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{pkg.tracking_number}</span>
        </div>
        <Badge className={getStatusColor(pkg.status)}>
          {getStatusLabel(pkg.status)}
        </Badge>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        <div className="font-medium">{pkg.customers?.name || 'Cliente no encontrado'}</div>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">
        {formatDescription(pkg.description)}
      </div>
      
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Weight className="h-3 w-3 text-gray-500" />
          <span className="font-medium">Peso:</span>
          <span className="text-gray-700">{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <Truck className="h-3 w-3 text-blue-500" />
          <span className="font-medium">Flete:</span>
          <span className="text-gray-700">{formatCurrency(pkg.freight)}</span>
        </div>
        
        {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span className="font-medium">A Cobrar:</span>
            <span className="text-green-700 font-semibold">{formatCurrency(pkg.amount_to_collect)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
