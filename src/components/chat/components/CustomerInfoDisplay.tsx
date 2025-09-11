
import { Package } from 'lucide-react';
import type { CustomerInfoDisplayProps } from '../types/AIResponseTypes';

export function CustomerInfoDisplay({ customerInfo, formatCurrency }: CustomerInfoDisplayProps) {
  return (
    <div className="text-xs bg-white rounded p-2 border space-y-1">
      <div className="flex items-center gap-2 font-medium">
        <Package className="h-3 w-3" />
        Resumen del cliente:
      </div>
      {customerInfo.pendingAmount > 0 && (
        <div className="text-red-600">
          💰 Saldo pendiente: {formatCurrency(customerInfo.pendingAmount)} 
          ({customerInfo.pendingPackages} encomienda{customerInfo.pendingPackages !== 1 ? 's' : ''})
        </div>
      )}
      {customerInfo.transitPackages > 0 && (
        <div className="text-blue-600">
          🚚 En tránsito: {customerInfo.transitPackages} encomienda{customerInfo.transitPackages !== 1 ? 's' : ''}
        </div>
      )}
      {customerInfo.pendingAmount === 0 && customerInfo.transitPackages === 0 && (
        <div className="text-green-600">
          ✅ Todo al día - sin pendientes
        </div>
      )}
    </div>
  );
}
