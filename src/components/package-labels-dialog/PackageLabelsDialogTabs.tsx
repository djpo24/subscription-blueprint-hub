
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Printer, Check } from 'lucide-react';
import { PackageWithRoute } from './PackageLabelsDialogTypes';
import { PackageLabelsDialogContent } from './PackageLabelsDialogContent';
import { PackageSearchBar } from '@/components/common/PackageSearchBar';
import { filterPackagesBySearchTerm } from '@/utils/packageSearchUtils';

interface PackageLabelsDialogTabsProps {
  pendingPackages: PackageWithRoute[];
  printedPackages: PackageWithRoute[];
  selectedPackageIds: Set<string>;
  selectedPrintedPackageIds: Set<string>;
  onPackageToggle: (packageId: string) => void;
  onPrintedPackageToggle: (packageId: string) => void;
  onSelectAll: (packages: PackageWithRoute[]) => void;
  onSelectAllPrinted: (packages: PackageWithRoute[]) => void;
  onPrintSingleLabel: (packageData: PackageWithRoute) => void;
}

export function PackageLabelsDialogTabs({
  pendingPackages,
  printedPackages,
  selectedPackageIds,
  selectedPrintedPackageIds,
  onPackageToggle,
  onPrintedPackageToggle,
  onSelectAll,
  onSelectAllPrinted,
  onPrintSingleLabel
}: PackageLabelsDialogTabsProps) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [printedSearchTerm, setPrintedSearchTerm] = useState('');

  // Filtrar paquetes pendientes
  const filteredPendingPackages = filterPackagesBySearchTerm(pendingPackages, pendingSearchTerm);
  
  // Filtrar paquetes impresos
  const filteredPrintedPackages = filterPackagesBySearchTerm(printedPackages, printedSearchTerm);

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Pendientes ({pendingPackages.length})
        </TabsTrigger>
        <TabsTrigger value="printed" className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Impresas ({printedPackages.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4 space-y-4">
        {/* Buscador para paquetes pendientes */}
        <PackageSearchBar
          searchTerm={pendingSearchTerm}
          onSearchChange={setPendingSearchTerm}
          placeholder="Buscar en pendientes..."
          className="max-w-md"
        />

        {/* Mostrar mensaje si hay búsqueda activa */}
        {pendingSearchTerm.trim() && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredPendingPackages.length} de {pendingPackages.length} encomiendas pendientes
          </div>
        )}

        <div className="overflow-auto max-h-96">
          {filteredPendingPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {pendingSearchTerm.trim() 
                ? "No se encontraron encomiendas pendientes que coincidan con la búsqueda"
                : "No hay encomiendas pendientes de imprimir etiqueta"
              }
            </div>
          ) : (
            <PackageLabelsDialogContent
              packages={filteredPendingPackages}
              selectedPackageIds={selectedPackageIds}
              onPackageToggle={onPackageToggle}
              onSelectAll={onSelectAll}
              onPrintSingleLabel={onPrintSingleLabel}
              isPrintedTab={false}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="printed" className="mt-4 space-y-4">
        {/* Buscador para paquetes impresos */}
        <PackageSearchBar
          searchTerm={printedSearchTerm}
          onSearchChange={setPrintedSearchTerm}
          placeholder="Buscar en impresas..."
          className="max-w-md"
        />

        {/* Mostrar mensaje si hay búsqueda activa */}
        {printedSearchTerm.trim() && (
          <div className="text-sm text-gray-600">
            Mostrando {filteredPrintedPackages.length} de {printedPackages.length} encomiendas impresas
          </div>
        )}

        <div className="overflow-auto max-h-96">
          {filteredPrintedPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {printedSearchTerm.trim() 
                ? "No se encontraron encomiendas impresas que coincidan con la búsqueda"
                : "No hay encomiendas con etiquetas impresas"
              }
            </div>
          ) : (
            <PackageLabelsDialogContent
              packages={filteredPrintedPackages}
              selectedPackageIds={selectedPrintedPackageIds}
              onPackageToggle={onPrintedPackageToggle}
              onSelectAll={onSelectAllPrinted}
              onPrintSingleLabel={onPrintSingleLabel}
              isPrintedTab={true}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
