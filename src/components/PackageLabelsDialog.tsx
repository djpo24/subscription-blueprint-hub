
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, MapPin, Calendar, User, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: string;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
}

interface PackageLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDate: Date;
  trips: Trip[];
}

export function PackageLabelsDialog({ open, onOpenChange, tripDate, trips }: PackageLabelsDialogProps) {
  const isMobile = useIsMobile();

  // Obtener todos los paquetes de todos los viajes
  const allPackages = trips.flatMap(trip => 
    trip.packages.map(pkg => ({
      ...pkg,
      origin: trip.origin,
      destination: trip.destination,
      flight_number: trip.flight_number
    }))
  );

  // Por ahora, simulamos el estado de impresión basado en el status
  // En el futuro, esto debería venir de una tabla específica de etiquetas impresas
  const pendingPackages = allPackages.filter(pkg => 
    pkg.status === 'recibido' || pkg.status === 'procesado'
  );
  
  const printedPackages = allPackages.filter(pkg => 
    pkg.status === 'transito' || pkg.status === 'en_destino' || pkg.status === 'delivered'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "en_destino":
      case "arrived":
        return "bg-blue-100 text-blue-800";
      case "transito":
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "procesado":
        return "bg-purple-100 text-purple-800";
      case "bodega":
        return "bg-gray-100 text-gray-800";
      case "recibido":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "en_destino":
      case "arrived":
        return "En Destino";
      case "transito":
      case "in_transit":
        return "En Tránsito";
      case "procesado":
        return "Procesado";
      case "bodega":
        return "En Bodega";
      case "recibido":
        return "Recibido";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number | null, currency: string = 'COP') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrintLabel = (packageId: string) => {
    // TODO: Implementar la lógica para imprimir la etiqueta
    console.log('Printing label for package:', packageId);
  };

  // Vista móvil con cards
  const renderMobileView = (packages: any[], showPrintButton: boolean = false) => (
    <div className="space-y-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    {pkg.tracking_number}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{pkg.customers?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{pkg.origin}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm">{pkg.destination}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Peso: {pkg.weight || 0} kg | Flete: {formatCurrency(pkg.freight)}
                  </div>
                  {pkg.amount_to_collect && (
                    <div className="text-sm text-orange-600">
                      A cobrar: {formatCurrency(pkg.amount_to_collect, pkg.currency)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getStatusColor(pkg.status)} text-xs`}>
                    {getStatusLabel(pkg.status)}
                  </Badge>
                  {showPrintButton && (
                    <Button
                      size="sm"
                      onClick={() => handlePrintLabel(pkg.id)}
                      className="flex items-center gap-1"
                    >
                      <Printer className="h-3 w-3" />
                      <span className="text-xs">Imprimir</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Vista desktop con tabla
  const renderDesktopView = (packages: any[], showPrintButton: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Seguimiento</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Peso</TableHead>
          <TableHead>Flete</TableHead>
          <TableHead>A Cobrar</TableHead>
          {showPrintButton && <TableHead>Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id} className="hover:bg-gray-50">
            <TableCell className="font-medium">
              {pkg.tracking_number}
            </TableCell>
            <TableCell>
              {pkg.customers?.name || 'N/A'}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <span className="text-sm">{pkg.origin}</span>
                <span className="mx-2">→</span>
                <span className="text-sm">{pkg.destination}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(pkg.status)}>
                {getStatusLabel(pkg.status)}
              </Badge>
            </TableCell>
            <TableCell>{pkg.weight || 0} kg</TableCell>
            <TableCell>{formatCurrency(pkg.freight)}</TableCell>
            <TableCell>
              {pkg.amount_to_collect ? 
                formatCurrency(pkg.amount_to_collect, pkg.currency) : 
                '-'
              }
            </TableCell>
            {showPrintButton && (
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handlePrintLabel(pkg.id)}
                  className="flex items-center gap-1"
                >
                  <Printer className="h-3 w-3" />
                  Imprimir
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Etiquetas - {format(tripDate, 'dd/MM/yyyy')}
          </DialogTitle>
          <DialogDescription>
            Gestiona las etiquetas de las encomiendas del viaje
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
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
              <>
                {isMobile 
                  ? renderMobileView(pendingPackages, true)
                  : renderDesktopView(pendingPackages, true)
                }
              </>
            )}
          </TabsContent>

          <TabsContent value="printed" className="mt-4 overflow-auto max-h-96">
            {printedPackages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay encomiendas con etiquetas impresas
              </div>
            ) : (
              <>
                {isMobile 
                  ? renderMobileView(printedPackages, false)
                  : renderDesktopView(printedPackages, false)
                }
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
