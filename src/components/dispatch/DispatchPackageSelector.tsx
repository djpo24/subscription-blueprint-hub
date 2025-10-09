
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Weight, DollarSign, Truck } from 'lucide-react';
import { PackageSearchBar } from '@/components/common/PackageSearchBar';
import { filterPackagesBySearchTerm } from '@/utils/packageSearchUtils';

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
    phone?: string;
    id_number?: string;
  } | null;
}

interface DispatchPackageSelectorProps {
  packages: PackageInfo[];
  selectedPackages: string[];
  onPackageToggle: (packageId: string, checked: boolean) => void;
  onSelectAll: () => void;
}

export function DispatchPackageSelector({ 
  packages, 
  selectedPackages, 
  onPackageToggle, 
  onSelectAll 
}: DispatchPackageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar paquetes usando la misma utilidad que el popup de etiquetas
  const filteredPackages = filterPackagesBySearchTerm(packages, searchTerm);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-base font-medium">
          Seleccionar Encomiendas ({packages.length} disponibles)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSelectAll}
        >
          {selectedPackages.length === packages.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
        </Button>
      </div>

      {/* Buscador - igual al del popup de etiquetas */}
      <PackageSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por nombre, número de encomienda, cédula o teléfono..."
        className="mb-4"
      />

      {/* Mostrar mensaje si hay búsqueda activa */}
      {searchTerm.trim() && (
        <div className="text-sm text-gray-600 mb-3">
          Mostrando {filteredPackages.length} de {packages.length} encomiendas
        </div>
      )}

      <div className="border rounded-lg max-h-60 overflow-y-auto">
        {filteredPackages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm.trim() 
              ? "No se encontraron encomiendas que coincidan con la búsqueda"
              : "No hay encomiendas disponibles para este día"
            }
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={pkg.id}
                  checked={selectedPackages.includes(pkg.id)}
                  onCheckedChange={(checked) => 
                    onPackageToggle(pkg.id, checked as boolean)
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {pkg.tracking_number}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pkg.customers?.name || 'Sin cliente'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      {pkg.weight || 0} kg
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      ${pkg.freight || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${pkg.amount_to_collect || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
