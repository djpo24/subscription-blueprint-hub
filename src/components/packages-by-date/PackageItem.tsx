
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Package, Weight, DollarSign, Truck, Boxes } from 'lucide-react';

interface PackageData {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  batch_id?: string | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface PackageItemProps {
  package: PackageData;
  onClick: (pkg: PackageData) => void;
  showBatchStatus?: boolean;
}

export function PackageItem({ package: pkg, onClick, showBatchStatus = false }: PackageItemProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
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
      case 'procesado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick(pkg)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="font-medium">{pkg.tracking_number}</div>
          <Badge className={getStatusColor(pkg.status)}>
            {pkg.status}
          </Badge>
          {showBatchStatus && (
            <Badge 
              variant={pkg.batch_id ? "default" : "outline"}
              className={pkg.batch_id ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
            >
              <Boxes className="h-3 w-3 mr-1" />
              {pkg.batch_id ? "En Bulto" : "Sin Bulto"}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>{pkg.customers?.name || 'Sin cliente'}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{pkg.origin} → {pkg.destination}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-1">
            <Weight className="h-3 w-3 text-purple-500" />
            <span>{pkg.weight || 0} kg</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3 text-orange-500" />
            <span>{formatCurrency(pkg.freight)}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span>{formatCurrency(pkg.amount_to_collect)}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 truncate">
          {pkg.description}
        </div>
      </div>
    </div>
  );
}
