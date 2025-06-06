
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle } from 'lucide-react';
import { SimpleCustomersPendingTable } from './SimpleCustomersPendingTable';
import { CollectedOrdersTable } from './CollectedOrdersTable';

export function FinancesTabs() {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Pagos Pendientes</span>
          <span className="sm:hidden">Pendientes</span>
        </TabsTrigger>
        <TabsTrigger value="collected" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Órdenes Cobradas</span>
          <span className="sm:hidden">Cobradas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-6">
        <SimpleCustomersPendingTable />
      </TabsContent>
      
      <TabsContent value="collected" className="mt-6">
        <CollectedOrdersTable />
      </TabsContent>
    </Tabs>
  );
}
