
import { Package, Weight, DollarSign, Truck } from 'lucide-react';
import { formatWeight, formatFreight, formatAmountToCollect } from '@/utils/formatters';

interface PackageInfo {
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

interface DispatchSummaryProps {
  selectedPackages: string[];
  packages: PackageInfo[];
}

export function DispatchSummary({ selectedPackages, packages }: DispatchSummaryProps) {
  const selectedPackagesData = packages.filter(pkg => selectedPackages.includes(pkg.id));
  const totals = selectedPackagesData.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  if (selectedPackages.length === 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-medium text-blue-900 mb-2">
        Resumen del Despacho
      </h3>
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-blue-600">Paquetes</div>
            <div className="font-bold">{selectedPackages.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-blue-600">Peso Total</div>
            <div className="font-bold">{formatWeight(totals.weight)} kg</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-blue-600">Flete Total</div>
            <div className="font-bold">${formatFreight(totals.freight)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <div>
            <div className="text-green-600">A Cobrar</div>
            <div className="font-bold text-green-700">{formatAmountToCollect(totals.amount_to_collect)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
