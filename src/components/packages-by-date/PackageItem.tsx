
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

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
        <div>{pkg.customers?.email}</div>
      </div>
      
      <div className="text-sm text-gray-500 mb-2">
        {pkg.description}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Peso: {pkg.weight ? `${pkg.weight} kg` : 'N/A'}</span>
        <span>Flete: {pkg.freight ? `$${pkg.freight.toLocaleString()}` : 'N/A'}</span>
        {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
          <span>A Cobrar: ${pkg.amount_to_collect.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
