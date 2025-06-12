
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerFinancialData } from '@/hooks/useCustomerFinancialData';
import { Truck, Clock, CheckCircle } from 'lucide-react';

interface CustomerFinancesTabsProps {
  customerId: string;
}

export function CustomerFinancesTabs({ customerId }: CustomerFinancesTabsProps) {
  const { financialData, isLoading } = useCustomerFinancialData(customerId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_transit': 'bg-blue-100 text-blue-800',
      'en_destino': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      'pending': 'Pendiente',
      'in_transit': 'En Tránsito',
      'en_destino': 'En Destino',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando datos financieros...</div>;
  }

  return (
    <Tabs defaultValue="pending-delivery" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending-delivery" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Pendientes Entrega
        </TabsTrigger>
        <TabsTrigger value="pending-payment" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pendientes Pago
        </TabsTrigger>
        <TabsTrigger value="collected" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Cobrados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending-delivery" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paquetes Pendientes de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            {financialData?.pendingDeliveryPackages && financialData.pendingDeliveryPackages.length > 0 ? (
              <div className="space-y-3">
                {financialData.pendingDeliveryPackages.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pkg.tracking_number}</span>
                      {getStatusBadge(pkg.status)}
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Flete: {formatCurrency(pkg.freight || 0)}</div>
                      <div>Por cobrar: {formatCurrency(pkg.amount_to_collect || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay paquetes pendientes de entrega</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending-payment" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paquetes con Pagos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {financialData?.pendingPaymentPackages && financialData.pendingPaymentPackages.length > 0 ? (
              <div className="space-y-3">
                {financialData.pendingPaymentPackages.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pkg.tracking_number}</span>
                      {getStatusBadge(pkg.status)}
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Por cobrar: {formatCurrency(pkg.amount_to_collect || 0)}</div>
                      <div>Pagado: {formatCurrency(pkg.totalPaid || 0)}</div>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      Pendiente: {formatCurrency((pkg.amount_to_collect || 0) - (pkg.totalPaid || 0))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay pagos pendientes</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="collected" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paquetes Completamente Cobrados</CardTitle>
          </CardHeader>
          <CardContent>
            {financialData?.collectedPackages && financialData.collectedPackages.length > 0 ? (
              <div className="space-y-3">
                {financialData.collectedPackages.map((pkg) => (
                  <div key={pkg.id} className="border border-green-200 rounded-lg p-4 space-y-2 bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pkg.tracking_number}</span>
                      {getStatusBadge(pkg.status)}
                    </div>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Flete: {formatCurrency(pkg.freight || 0)}</div>
                      <div>Cobrado: {formatCurrency(pkg.totalPaid || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay paquetes completamente cobrados</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
