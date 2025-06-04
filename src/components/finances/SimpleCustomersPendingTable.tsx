
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Package, DollarSign } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';

export function SimpleCustomersPendingTable() {
  const { data, isLoading, error } = useFinancialData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error al cargar los datos: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.customersPending || data.customersPending.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">¡Excelente!</p>
            <p>No hay clientes con cobros pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Clientes con Cobros Pendientes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.customersPending.length} cliente{data.customersPending.length !== 1 ? 's' : ''} con paquetes pendientes de cobro
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-center">Paquetes</TableHead>
                <TableHead className="text-right">Monto Pendiente</TableHead>
                <TableHead>Números de Seguimiento</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.customersPending.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>
                    <div className="font-medium">{customer.customer_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{customer.package_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(customer.total_pending)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <span className="text-sm font-mono text-muted-foreground">
                        {customer.tracking_numbers.join(', ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        // TODO: Implementar registro de pago
                        console.log('Registrar pago para:', customer.customer_name);
                      }}
                      className="gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      Registrar Pago
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
