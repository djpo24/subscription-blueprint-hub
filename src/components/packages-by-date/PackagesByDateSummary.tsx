
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Weight, DollarSign, Banknote } from 'lucide-react';

interface PackagesByDateSummaryProps {
  totalPackages: number;
  totalWeight: number;
  totalFreight: number;
  totalAmountToCollect: number;
}

export function PackagesByDateSummary({
  totalPackages,
  totalWeight,
  totalFreight,
  totalAmountToCollect
}: PackagesByDateSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Encomiendas</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
          <Weight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWeight.toFixed(1)} kg</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Flete Total 
            <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded ml-1 font-bold">
              COP
            </span>
          </CardTitle>
          <DollarSign className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            ${totalFreight.toLocaleString('es-CO')}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Siempre en Pesos Colombianos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total a Cobrar
            <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded ml-1">
              Mixto
            </span>
          </CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalAmountToCollect.toLocaleString('es-CO')}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Suma en diferentes divisas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
