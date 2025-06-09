
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Printer, Check } from 'lucide-react';
import { PackageWithRoute } from './PackageLabelsDialogTypes';
import { PackageLabelsDialogContent } from './PackageLabelsDialogContent';

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

      <TabsContent value="pending" className="mt-4 overflow-auto max-h-96">
        {pendingPackages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay encomiendas pendientes de imprimir etiqueta
          </div>
        ) : (
          <PackageLabelsDialogContent
            packages={pendingPackages}
            selectedPackageIds={selectedPackageIds}
            onPackageToggle={onPackageToggle}
            onSelectAll={onSelectAll}
            onPrintSingleLabel={onPrintSingleLabel}
            isPrintedTab={false}
          />
        )}
      </TabsContent>

      <TabsContent value="printed" className="mt-4 overflow-auto max-h-96">
        {printedPackages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay encomiendas con etiquetas impresas
          </div>
        ) : (
          <PackageLabelsDialogContent
            packages={printedPackages}
            selectedPackageIds={selectedPrintedPackageIds}
            onPackageToggle={onPrintedPackageToggle}
            onSelectAll={onSelectAllPrinted}
            onPrintSingleLabel={onPrintSingleLabel}
            isPrintedTab={true}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
