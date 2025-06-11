
import { Package } from 'lucide-react';

export function DispatchPackagesTableEmpty() {
  return (
    <div className="text-center py-12">
      <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay paquetes en este despacho
      </h3>
      <p className="text-gray-500">
        Este despacho no contiene paquetes
      </p>
    </div>
  );
}
