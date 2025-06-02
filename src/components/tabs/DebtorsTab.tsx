
import { TabsContent } from '@/components/ui/tabs';
import { Tabs, TabsContent as InnerTabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DebtorsList } from '@/components/debtors/DebtorsList';
import { TravelerStats } from '@/components/debtors/TravelerStats';
import { DebtSummary } from '@/components/debtors/DebtSummary';
import { useDebtData } from '@/hooks/useDebtData';

export function DebtorsTab() {
  const { data, isLoading } = useDebtData();

  if (isLoading) {
    return (
      <TabsContent value="debtors" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
        <div className="text-center py-8">Cargando información de deudas...</div>
      </TabsContent>
    );
  }

  const { debts = [], travelerStats = [], collectionStats = {} } = data || {};

  return (
    <TabsContent value="debtors" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="space-y-4 sm:space-y-6">
        <DebtSummary collectionStats={collectionStats} />
        
        <Tabs defaultValue="debtors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="debtors" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Lista de Deudores</span>
              <span className="sm:hidden">Deudores</span>
            </TabsTrigger>
            <TabsTrigger value="travelers" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Estadísticas por Viajero</span>
              <span className="sm:hidden">Viajeros</span>
            </TabsTrigger>
          </TabsList>
          
          <InnerTabsContent value="debtors" className="mt-4 sm:mt-6">
            <DebtorsList debts={debts} />
          </InnerTabsContent>
          
          <InnerTabsContent value="travelers" className="mt-4 sm:mt-6">
            <TravelerStats travelerStats={travelerStats} />
          </InnerTabsContent>
        </Tabs>
      </div>
    </TabsContent>
  );
}
