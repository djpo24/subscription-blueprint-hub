import { BultoManagement } from '@/components/bultos/BultoManagement';

export function BultosTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Bultos</h2>
        <p className="text-muted-foreground mt-2">
          Organiza las encomiendas en bultos para facilitar su manejo y localización
        </p>
      </div>

      <BultoManagement />
    </div>
  );
}
