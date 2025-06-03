
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditPackageDialog } from './EditPackageDialog';
import { MultipleLabelsDialog } from './MultipleLabelsDialog';
import { PackagesTableHeader } from './packages-table/PackagesTableHeader';
import { PackagesTableRow } from './packages-table/PackagesTableRow';
import { ChatDialog } from './chat/ChatDialog';

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

  // Ensure filteredPackages is always an array
  const safeFilteredPackages = filteredPackages || [];

  const handleUpdate = () => {
    if (onUpdate) {
      // Since the existing onUpdate expects (id, updates), but we're calling it without parameters,
      // we'll create a wrapper that calls it appropriately when needed
      // For now, we'll call it with empty parameters as a general refresh
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
          packagesCount={safeFilteredPackages.length}
          onPrintMultiple={handlePrintMultiple}
        />
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Cargando...</div>
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
                  <TableHead>Chat</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeFilteredPackages.map((pkg) => (
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
        packages={safeFilteredPackages}
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
