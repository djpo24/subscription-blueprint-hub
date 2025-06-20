
import { TabsContent } from '@/components/ui/tabs';
import { CustomersList } from '@/components/customer-list/CustomersList';
import { DebugCustomersStatus } from '@/components/DebugCustomersStatus';

export function CustomersTab() {
  return (
    <TabsContent value="customers" className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Clientes</h2>
            <p className="text-muted-foreground">
              Administra y visualiza todos los clientes registrados en el sistema
            </p>
          </div>
        </div>
        
        <DebugCustomersStatus />
        <CustomersList />
      </div>
    </TabsContent>
  );
}
