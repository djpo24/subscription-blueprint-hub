
import { CustomersList } from '@/components/customer-list/CustomersList';
import { DebugCustomersStatus } from '@/components/DebugCustomersStatus';

export default function CustomersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza todos los clientes registrados en el sistema
          </p>
        </div>
        
        <DebugCustomersStatus />
        <CustomersList />
      </div>
    </div>
  );
}
