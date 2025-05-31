
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

interface MultiplePackageSelectorProps {
  packages: Package[];
  onPrintSelected: (selectedPackages: Package[]) => void;
}

export function MultiplePackageSelector({ packages, onPrintSelected }: MultiplePackageSelectorProps) {
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      case "arrived":
        return "bg-purple-100 text-purple-800";
      case "warehouse":
        return "bg-gray-100 text-gray-800";
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
      case "pending":
        return "Pendiente";
      case "delayed":
        return "Retrasado";
      case "arrived":
        return "Llegado";
      case "warehouse":
        return "En Bodega";
      default:
        return status;
    }
  };

  const handlePackageToggle = (packageId: string) => {
    const newSelected = new Set(selectedPackageIds);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedPackageIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPackageIds.size === packages.length) {
      setSelectedPackageIds(new Set());
    } else {
      setSelectedPackageIds(new Set(packages.map(pkg => pkg.id)));
    }
  };

  const handlePrintSelected = () => {
    const selectedPackages = packages.filter(pkg => selectedPackageIds.has(pkg.id));
    onPrintSelected(selectedPackages);
  };

  const selectedCount = selectedPackageIds.size;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Seleccionar Etiquetas para Imprimir</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedPackageIds.size === packages.length && packages.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Seleccionar todo
              </label>
            </div>
            {selectedCount > 0 && (
              <Button onClick={handlePrintSelected} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir {selectedCount} etiqueta{selectedCount !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <Checkbox
                id={pkg.id}
                checked={selectedPackageIds.has(pkg.id)}
                onCheckedChange={() => handlePackageToggle(pkg.id)}
              />
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                <div>
                  <div className="font-medium">{pkg.tracking_number}</div>
                </div>
                <div>
                  <div className="text-sm">{pkg.customers?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm">
                    {pkg.origin} → {pkg.destination}
                  </div>
                </div>
                <div>
                  <Badge className={getStatusColor(pkg.status)}>
                    {getStatusLabel(pkg.status)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(pkg.created_at), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
