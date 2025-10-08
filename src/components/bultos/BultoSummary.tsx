import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface BultoSummaryProps {
  bultoNumber: number;
  packages: any[];
  notes?: string;
}

export function BultoSummary({ bultoNumber, packages, notes }: BultoSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Bulto #{bultoNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de Paquetes</p>
              <p className="text-2xl font-bold">{packages.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peso Total</p>
              <p className="text-2xl font-bold">
                {packages.reduce((sum, p) => sum + (p.weight || 0), 0).toFixed(2)} kg
              </p>
            </div>
          </div>

          {notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notas</p>
              <p className="text-sm">{notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paquetes Incluidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {packages.map((pkg, index) => (
              <div 
                key={pkg.id}
                className="flex items-start gap-3 p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-medium">{pkg.tracking_number}</p>
                  <p className="text-sm text-muted-foreground">{pkg.customers?.name}</p>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                  )}
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    {pkg.weight && <span>Peso: {pkg.weight} kg</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
