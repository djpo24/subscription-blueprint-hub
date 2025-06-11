
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, CheckCircle } from 'lucide-react';
import { FinancesTabs } from '@/components/finances/FinancesTabs';
import { useFinancialData } from '@/hooks/useFinancialData';

export function FinancesTab() {
  const { data, isLoading, error } = useFinancialData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <TabsContent value="finances" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="min-h-[100px] sm:min-h-auto">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Cargando datos financieros...</p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="finances" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
        <Card>
          <CardContent className="p-8 text-center text-red-500">
            <p>Error al cargar datos financieros</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  const summary = data?.summary;

  return (
    <TabsContent value="finances" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Fletes Cobrados</span>
                <span className="sm:hidden">Fletes</span>
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-orange-600 leading-tight">
                {formatCurrency(summary?.totalFreight || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total del mes
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Pendiente Cobro</span>
                <span className="sm:hidden">Pendiente</span>
              </CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">
                {formatCurrency(summary?.pendingCollections || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por cobrar
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Dinero Cobrado</span>
                <span className="sm:hidden">Cobrado</span>
              </CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 leading-tight">
                {formatCurrency(summary?.totalCollected || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recaudado
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Paquetes Entregados</span>
                <span className="sm:hidden">Entregados</span>
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 leading-tight">
                {summary?.deliveredPackages || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {summary?.totalPackages || 0} total
              </p>
            </CardContent>
          </Card>
        </div>

        <FinancesTabs />
      </div>
    </TabsContent>
  );
}
