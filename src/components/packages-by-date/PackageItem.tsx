
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Weight, DollarSign } from 'lucide-react';

interface PackageData {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
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
  // Contar items en la descripción
  const itemCount = pkg.description 
    ? pkg.description.split(',').filter(item => item.trim()).length 
    : 0;

  return (
    <div
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
      onClick={() => onClick(pkg)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">
          {pkg.tracking_number}
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            pkg.status === 'delivered' ? 'bg-green-50 text-green-700' :
            pkg.status === 'in_transit' ? 'bg-blue-50 text-blue-700' :
            pkg.status === 'arrived' ? 'bg-orange-50 text-orange-700' :
            'bg-gray-50 text-gray-700'
          }`}
        >
          {pkg.status}
        </Badge>
      </div>
      
      {/* Cliente y conteo de items en la misma línea */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-bold text-blue-700">
          {pkg.customers?.name || 'Cliente no especificado'}
        </div>
        
        {itemCount > 0 && (
          <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Información de flete, peso y valor a cobrar */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
        {/* Flete */}
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-500" />
          <div className="text-xs">
            <div className="text-gray-500">Flete</div>
            <div className="font-medium">
              ${pkg.freight || '0'} COP
            </div>
          </div>
        </div>

        {/* Peso */}
        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4 text-gray-500" />
          <div className="text-xs">
            <div className="text-gray-500">Peso</div>
            <div className="font-medium">
              {pkg.weight || '0'} kg
            </div>
          </div>
        </div>

        {/* Valor a cobrar - RESALTADO */}
        <div className="flex items-center gap-2 bg-green-100 p-2 rounded border-l-4 border-l-green-500">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div className="text-xs">
            <div className="text-green-600 font-medium">A Cobrar</div>
            <div className="font-bold text-green-700 text-sm">
              ${pkg.amount_to_collect || '0'} COP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
