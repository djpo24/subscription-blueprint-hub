
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Package, ExternalLink } from 'lucide-react';
import { usePackages } from '@/hooks/usePackages';
import { PackageActionsDropdown } from '@/components/PackageActionsDropdown';
import { PackageLabelDialog } from '@/components/PackageLabelDialog';
import { EditPackageDialog } from '@/components/EditPackageDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, type Currency } from '@/utils/currencyFormatter';
import { useQueryClient } from '@tanstack/react-query';

interface PackageDialogData {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  trip_id: string | null;
  customers?: {
    name: string;
    email: string;
  };
}

export function AllPackagesTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: packages = [], isLoading } = usePackages();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const filteredPackages = packages.filter(pkg => 
    pkg.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregado';
      case 'in_transit': return 'En tránsito';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleAction = (action: string, packageId: string) => {
    setSelectedPackageId(packageId);
    switch (action) {
      case 'label':
        setIsLabelDialogOpen(true);
        break;
      case 'edit':
        setIsEditDialogOpen(true);
        break;
    }
  };

  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);

  // Transform package data to match dialog expectations
  const getPackageDialogData = (pkg: typeof selectedPackage): PackageDialogData | null => {
    if (!pkg) return null;
    
    return {
      id: pkg.id,
      tracking_number: pkg.tracking_number || '',
      customer_id: pkg.customer_id || '',
      description: pkg.description || '',
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      currency: (pkg.currency as Currency) || 'COP',
      status: pkg.status || 'pending',
      origin: pkg.origin || '',
      destination: pkg.destination || '',
      created_at: pkg.created_at || new Date().toISOString(),
      trip_id: pkg.trip_id,
      customers: pkg.customers
    };
  };

  const packageDialogData = getPackageDialogData(selectedPackage);

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    setIsEditDialogOpen(false);
    setSelectedPackageId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todas las Encomiendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando encomiendas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Todas las Encomiendas
              <Badge variant="secondary">{filteredPackages.length}</Badge>
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar encomiendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron encomiendas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Cobrar</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm">
                          {pkg.tracking_number || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.customers?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{pkg.customers?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{pkg.description || 'Sin descripción'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pkg.status || 'pending')}>
                          {getStatusText(pkg.status || 'pending')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{pkg.destination || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        {pkg.amount_to_collect && pkg.amount_to_collect > 0 ? (
                          <span className="font-medium text-green-600">
                            {formatCurrency(pkg.amount_to_collect, (pkg.currency as Currency) || 'COP')}
                          </span>
                        ) : (
                          <span className="text-gray-400">$0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMobile ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction('edit', pkg.id)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('label', pkg.id)}>
                                Imprimir etiqueta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <PackageActionsDropdown 
                            package={pkg} 
                            onAction={(action) => handleAction(action, pkg.id)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {packageDialogData && (
        <>
          <PackageLabelDialog
            package={packageDialogData}
            open={isLabelDialogOpen}
            onOpenChange={(open) => {
              setIsLabelDialogOpen(open);
              if (!open) setSelectedPackageId(null);
            }}
          />
          <EditPackageDialog
            package={packageDialogData}
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setSelectedPackageId(null);
            }}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </>
  );
}
