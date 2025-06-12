
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckCircle, Truck } from 'lucide-react';
import { SimpleCustomersPendingTable } from './SimpleCustomersPendingTable';
import { CollectedOrdersTable } from './CollectedOrdersTable';
import { PendingDeliveryTable } from './PendingDeliveryTable';

export function FinancesTabs() {
  return (
    <Tabs defaultValue="pending-delivery" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending-delivery" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Pendientes de Entrega</span>
          <span className="sm:hidden">P. Entrega</span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Pagos Pendientes</span>
          <span className="sm:hidden">P. Pagos</span>
        </TabsTrigger>
        <TabsTrigger value="collected" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Órdenes Cobradas</span>
          <span className="sm:hidden">Cobradas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending-delivery" className="mt-6">
        <PendingDeliveryTable />
      </TabsContent>
      
      <TabsContent value="pending" className="mt-6">
        <SimpleCustomersPendingTable />
      </TabsContent>
      
      <TabsContent value="collected" className="mt-6">
        <CollectedOrdersTable />
      </TabsContent>
    </Tabs>
  );
}
