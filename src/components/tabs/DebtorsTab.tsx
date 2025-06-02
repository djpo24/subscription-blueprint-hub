
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
      <TabsContent value="debtors" className="space-y-8">
        <div className="text-center py-8">Cargando información de deudas...</div>
      </TabsContent>
    );
  }

  const { debts = [], travelerStats = [], collectionStats = {} } = data || {};

  return (
    <TabsContent value="debtors" className="space-y-8">
      <div className="space-y-6">
        <DebtSummary collectionStats={collectionStats} />
        
        <Tabs defaultValue="debtors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="debtors">Lista de Deudores</TabsTrigger>
            <TabsTrigger value="travelers">Estadísticas por Viajero</TabsTrigger>
          </TabsList>
          
          <InnerTabsContent value="debtors" className="mt-6">
            <DebtorsList debts={debts} />
          </InnerTabsContent>
          
          <InnerTabsContent value="travelers" className="mt-6">
            <TravelerStats travelerStats={travelerStats} />
          </InnerTabsContent>
        </Tabs>
      </div>
    </TabsContent>
  );
}
