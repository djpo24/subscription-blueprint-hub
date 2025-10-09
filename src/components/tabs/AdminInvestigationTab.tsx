
import { AdminInvestigationPanel } from '@/components/admin/AdminInvestigationPanel';
import { DeliveryErrorsTable } from '@/components/DeliveryErrorsTable';
import { WhatsAppErrorLogsTable } from '@/components/WhatsAppErrorLogsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function AdminInvestigationTab() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Investigación General</TabsTrigger>
          <TabsTrigger value="delivery-errors">Errores de Entrega</TabsTrigger>
          <TabsTrigger value="whatsapp-logs">Logs WhatsApp</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <AdminInvestigationPanel />
          </TabsContent>

          <TabsContent value="delivery-errors">
            <DeliveryErrorsTable />
          </TabsContent>

          <TabsContent value="whatsapp-logs">
            <WhatsAppErrorLogsTable />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
