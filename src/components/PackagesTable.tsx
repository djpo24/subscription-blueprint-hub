
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditPackageDialog } from './EditPackageDialog';
import { MultipleLabelsDialog } from './MultipleLabelsDialog';
import { PackagesTableHeader } from './packages-table/PackagesTableHeader';
import { PackagesTableRow } from './packages-table/PackagesTableRow';
import { PackageTableDetails } from './packages-table/PackageTableDetails';
import { ChatDialog } from './chat/ChatDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search } from 'lucide-react';
import { usePackageSearch } from '@/hooks/usePackageSearch';
import { parseCurrencyString } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  trip_id: string | null;
  customer_id: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackagesTableProps {
  packages: Package[];
  filteredPackages: Package[];
  isLoading: boolean;
  onUpdate?: (id: string, updates: any) => void;
  disableChat?: boolean;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function PackagesTable({ 
  packages, 
  filteredPackages, 
  isLoading, 
  onUpdate,
  disableChat = false,
  previewRole
}: PackagesTableProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMultipleLabelsDialog, setShowMultipleLabelsDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Usar el hook de búsqueda global cuando hay término de búsqueda
  const { data: searchResults = [], isLoading: isSearching } = usePackageSearch(searchQuery);

  // Determinar qué encomiendas mostrar
  const displayPackages = searchQuery.trim() ? searchResults : (filteredPackages || []);
  const displayIsLoading = searchQuery.trim() ? isSearching : isLoading;

  // Mostrar detalles específicos si se encuentra una encomienda específica
  const specificPackage = searchQuery.trim() && displayPackages.length === 1 ? displayPackages[0] : null;

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate('', {});
    }
  };

  const handleRowClick = (pkg: Package) => {
    if (pkg.status !== 'delivered') {
      setSelectedPackage(pkg);
      setShowEditDialog(true);
    }
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedPackage(null);
    handleUpdate();
  };

  const handlePrintMultiple = () => {
    setShowMultipleLabelsDialog(true);
  };

  const handleOpenChat = (customerId: string, customerName?: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setShowChatDialog(true);
  };

  return (
    <>
      <Card>
        <PackagesTableHeader 
          packagesCount={displayPackages.length}
          onPrintMultiple={handlePrintMultiple}
        />
        <CardContent>
          {/* Buscador global de encomiendas */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por número de tracking, cliente, cédula, teléfono... (busca en toda la base de datos)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 text-sm text-gray-600">
                {displayIsLoading ? (
                  'Buscando...'
                ) : (
                  `${displayPackages.length} encomienda(s) encontrada(s) ${searchQuery.trim() ? 'en toda la base de datos' : 'en las recientes'}`
                )}
              </div>
            )}
          </div>

          {/* Mostrar detalles específicos si se encuentra una encomienda */}
          {specificPackage && (
            <div className="mb-6">
              <Alert>
                <AlertDescription>
                  Encomienda encontrada: {specificPackage.tracking_number}
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <PackageTableDetails
                  trackingNumber={specificPackage.tracking_number}
                  amountToCollect={specificPackage.amount_to_collect}
                  currency={parseCurrencyString(specificPackage.currency)}
                  freight={specificPackage.freight}
                  weight={specificPackage.weight}
                />
              </div>
            </div>
          )}

          {displayIsLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">
                {searchQuery.trim() ? 'Buscando encomiendas...' : 'Cargando...'}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>A Cobrar</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Chat</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPackages.map((pkg) => (
                  <PackagesTableRow
                    key={pkg.id}
                    package={pkg}
                    onRowClick={handleRowClick}
                    onActionsClick={handleActionsClick}
                    onUpdate={handleUpdate}
                    onOpenChat={handleOpenChat}
                    previewRole={previewRole}
                    disableChat={disableChat}
                    showChatInSeparateColumn={true}
                  />
                ))}
              </TableBody>
            </Table>
          )}

          {!displayIsLoading && displayPackages.length === 0 && searchQuery.trim() && (
            <div className="text-center py-8">
              <div className="text-gray-500">
                No se encontraron encomiendas que coincidan con la búsqueda "{searchQuery}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditPackageDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        package={selectedPackage}
        onSuccess={handleEditSuccess}
      />

      <MultipleLabelsDialog
        open={showMultipleLabelsDialog}
        onOpenChange={setShowMultipleLabelsDialog}
        packages={displayPackages}
      />

      <ChatDialog
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
    </>
  );
}
