import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, CheckCircle } from 'lucide-react';
import { FinancesTabs } from '@/components/finances/FinancesTabs';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAvailableTravelers } from '@/hooks/useTravelers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';

export function FinancesTab() {
  const { data, isLoading, error } = useFinancialData();
  const { data: travelers = [] } = useAvailableTravelers();
  const [selectedTravelerId, setSelectedTravelerId] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar datos por viajero - DEBE estar antes de cualquier early return
  const filteredData = useMemo(() => {
    if (!data || selectedTravelerId === 'all') return data;

    // Buscar el user_id del viajero seleccionado
    const selectedTraveler = travelers.find(t => t.id === selectedTravelerId);
    if (!selectedTraveler) {
      console.warn('⚠️ [FinancesTab] Traveler not found:', selectedTravelerId);
      return data;
    }

    const travelerUserId = selectedTraveler.user_id;
    console.log('🔍 [FinancesTab] Filtering by traveler user_id:', travelerUserId);
    
    // Filtrar paquetes por viajero usando el user_id
    const filteredPackages = data.packages.filter(pkg => 
      pkg.delivered_by === travelerUserId
    );
    
    console.log('✅ [FinancesTab] Filtered packages:', filteredPackages.length, 'out of', data.packages.length);

    // Filtrar pagos relacionados a esos paquetes
    const packageIds = new Set(filteredPackages.map(p => p.id));
    const filteredPayments = data.payments.filter(payment => 
      packageIds.has(payment.package_id)
    );

    // Recalcular métricas
    const totalPackages = filteredPackages.length;
    const deliveredPackages = filteredPackages.filter(p => p.status === 'delivered').length;
    const totalFreight = filteredPackages.reduce((sum, p) => sum + (p.freight || 0), 0);

    const eligiblePackages = filteredPackages.filter(p => 
      (p.status === 'en_destino' || p.status === 'delivered') && 
      p.amount_to_collect && 
      p.amount_to_collect > 0
    );

    const totalAmountToCollect = eligiblePackages.reduce((sum, p) => 
      sum + (p.amount_to_collect || 0), 0
    );

    const totalCollected = filteredPayments.reduce((sum, p) => {
      const isEligiblePackage = eligiblePackages.some(pkg => pkg.id === p.package_id);
      return isEligiblePackage ? sum + (p.amount || 0) : sum;
    }, 0);

    const pendingCollections = Math.max(0, totalAmountToCollect - totalCollected);

    const totalPendingPackages = eligiblePackages.filter(p => {
      const packagePayments = filteredPayments.filter(payment => payment.package_id === p.id);
      const totalPaidForPackage = packagePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      return (p.amount_to_collect || 0) > totalPaidForPackage;
    }).length;

    return {
      summary: {
        totalCollected,
        totalPending: pendingCollections,
        totalPayments: filteredPayments.length,
        totalPendingPackages,
        totalFreight,
        pendingCollections,
        deliveredPackages,
        totalPackages
      },
      packages: filteredPackages,
      payments: filteredPayments
    };
  }, [data, selectedTravelerId, travelers]);

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

  const summary = filteredData?.summary;

  return (
    <TabsContent value="finances" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
        {/* Filtro de viajero */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap">Filtrar por viajero:</label>
              <Select value={selectedTravelerId} onValueChange={setSelectedTravelerId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Seleccionar viajero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los viajeros</SelectItem>
                  {travelers.map((traveler) => (
                    <SelectItem key={traveler.id} value={traveler.id}>
                      {traveler.first_name} {traveler.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 leading-tight">
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
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-green-600 leading-tight">
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
