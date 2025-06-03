
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { CustomersPendingTable } from '@/components/finances/CustomersPendingTable';

export function FinancesTab() {
  return (
    <TabsContent value="finances" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Ingresos Totales</span>
                <span className="sm:hidden">Ingresos</span>
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">
                $0
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Gastos Totales</span>
                <span className="sm:hidden">Gastos</span>
              </CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-red-600 leading-tight">
                $0
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Ganancia Neta</span>
                <span className="sm:hidden">Ganancia</span>
              </CardTitle>
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold leading-tight">
                $0
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresos - Gastos
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[100px] sm:min-h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                <span className="hidden sm:inline">Fletes Cobrados</span>
                <span className="sm:hidden">Fletes</span>
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">
                $0
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total acumulado
              </p>
            </CardContent>
          </Card>
        </div>

        <CustomersPendingTable />
      </div>
    </TabsContent>
  );
}
