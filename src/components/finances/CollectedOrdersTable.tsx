
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Phone, Package, Calendar, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollectedOrders } from '@/hooks/useCollectedOrders';
import { formatCurrency } from '@/utils/currencyFormatter';

export function CollectedOrdersTable() {
  const { data: collectedOrders, isLoading, error, refetch } = useCollectedOrders();

  const handleRetry = () => {
    console.log('🔄 Reintentando cargar órdenes cobradas...');
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap: { [key: string]: { label: string; variant: any } } = {
      'efectivo': { label: 'Efectivo', variant: 'default' },
      'transferencia': { label: 'Transferencia', variant: 'secondary' },
      'tarjeta': { label: 'Tarjeta', variant: 'outline' },
    };
    
    const methodInfo = methodMap[method] || { label: method, variant: 'outline' };
    return <Badge variant={methodInfo.variant}>{methodInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Órdenes Cobradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando órdenes cobradas...</p>
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
            <CheckCircle className="h-5 w-5" />
            Órdenes Cobradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar órdenes cobradas</p>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCollected = collectedOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Órdenes Cobradas
            {collectedOrders && collectedOrders.length > 0 && (
              <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                {collectedOrders.length}
              </Badge>
            )}
          </CardTitle>
          {collectedOrders && collectedOrders.length > 0 && (
            <div className="text-sm text-gray-600">
              Total cobrado: <span className="font-medium text-green-600">
                {formatCurrency(totalCollected, 'COP')}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Historial de pagos recibidos de clientes
        </p>
      </CardHeader>
      <CardContent>
        {!collectedOrders || collectedOrders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay órdenes cobradas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Procesado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectedOrders.map((order, index) => (
                  <TableRow 
                    key={`${order.payment_id}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {order.customer_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-mono">
                          {order.tracking_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.destination}</span>
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(order.payment_method)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(order.amount || 0, order.currency as 'COP' | 'AWG' || 'COP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-sm">
                          {formatDate(order.payment_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {order.created_by || 'Sistema'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
