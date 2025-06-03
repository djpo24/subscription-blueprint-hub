
import { Card, CardContent } from '@/components/ui/card';
import type { PackageInDispatch } from '@/types/dispatch';

interface PackageInfoProps {
  package: PackageInDispatch;
}

export function PackageInfo({ package: pkg }: PackageInfoProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Cliente:</span> {pkg.customers?.name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Destino:</span> {pkg.destination}
          </div>
          <div>
            <span className="font-medium">Monto a cobrar:</span> ${pkg.amount_to_collect?.toLocaleString('es-CO') || 0}
          </div>
          <div>
            <span className="font-medium">Descripción:</span> {pkg.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
