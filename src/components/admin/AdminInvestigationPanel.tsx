
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageStatusInvestigation } from './PackageStatusInvestigation';
import { AlertTriangle } from 'lucide-react';

export function AdminInvestigationPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Panel de Investigación Administrativa
          </CardTitle>
          <CardDescription>
            Herramientas para investigar cambios de estado y actividades sospechosas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackageStatusInvestigation />
        </CardContent>
      </Card>
    </div>
  );
}
