
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer } from 'lucide-react';

interface PackagesTableHeaderProps {
  packagesCount: number;
  onPrintMultiple: () => void;
}

export function PackagesTableHeader({ packagesCount, onPrintMultiple }: PackagesTableHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Encomiendas Recientes</CardTitle>
          <CardDescription>
            Últimas encomiendas registradas en el sistema. Haz click en una encomienda para editarla.
          </CardDescription>
        </div>
        <Button
          onClick={onPrintMultiple}
          variant="outline"
          className="flex items-center gap-2"
          disabled={packagesCount === 0}
        >
          <Printer className="h-4 w-4" />
          Imprimir Múltiples
        </Button>
      </div>
    </CardHeader>
  );
}
