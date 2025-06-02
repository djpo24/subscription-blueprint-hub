
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Package, Weight, DollarSign, User, MapPin } from 'lucide-react';
import { useDispatchPackages } from '@/hooks/useDispatchRelations';

interface DispatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string | null;
}

export function DispatchDetailsDialog({ 
  open, 
  onOpenChange, 
  dispatchId 
}: DispatchDetailsDialogProps) {
  const { data: packages = [], isLoading } = useDispatchPackages(dispatchId || '');

  if (!dispatchId) return null;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const totals = packages.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Detalles del Despacho
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Cargando detalles del despacho...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{packages.length}</div>
                      <div className="text-xs text-gray-600">Paquetes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{totals.weight} kg</div>
                      <div className="text-xs text-gray-600">Peso Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(totals.freight)}</div>
                      <div className="text-xs text-gray-600">Flete Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-700">{formatCurrency(totals.amount_to_collect)}</div>
                      <div className="text-xs text-gray-600">A Cobrar</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de paquetes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paquetes en el Despacho</CardTitle>
              </CardHeader>
              <CardContent>
                {packages.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No hay paquetes en este despacho
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Flete</TableHead>
                        <TableHead>A Cobrar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">
                            {pkg.tracking_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              {pkg.customers?.name || 'Sin cliente'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {pkg.origin} → {pkg.destination}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                pkg.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                pkg.status === 'in_transit' ? 'bg-blue-50 text-blue-700' :
                                pkg.status === 'arrived' ? 'bg-orange-50 text-orange-700' :
                                'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {pkg.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate text-sm">
                              {pkg.description}
                            </div>
                          </TableCell>
                          <TableCell>{pkg.weight || 0} kg</TableCell>
                          <TableCell>{formatCurrency(pkg.freight)}</TableCell>
                          <TableCell className="font-medium text-green-700">
                            {formatCurrency(pkg.amount_to_collect)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
