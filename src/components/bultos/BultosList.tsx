import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Printer, Plus } from 'lucide-react';
import { useState } from 'react';
import { BultoLabelDialog } from './BultoLabelDialog';

interface BultosListProps {
  bultos: any[];
  onUpdate: () => void;
}

export function BultosList({ bultos, onUpdate }: BultosListProps) {
  const [selectedBulto, setSelectedBulto] = useState<any>(null);

  if (bultos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No hay bultos creados</p>
        <p className="text-sm mt-1">Crea tu primer bulto para organizar las encomiendas</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {bultos.map((bulto) => (
          <Card key={bulto.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Bulto #{bulto.bulto_number}</h3>
                    <Badge variant={bulto.status === 'open' ? 'default' : 'secondary'}>
                      {bulto.status}
                    </Badge>
                  </div>
                  
                  {bulto.trips && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {bulto.trips.origin} → {bulto.trips.destination}
                      <span className="ml-2">
                        {new Date(bulto.trips.trip_date).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {bulto.total_packages} paquetes
                    </span>
                  </div>

                  {bulto.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {bulto.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBulto(bulto)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Etiqueta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBulto && (
        <BultoLabelDialog
          open={!!selectedBulto}
          onOpenChange={(open) => !open && setSelectedBulto(null)}
          bulto={selectedBulto}
        />
      )}
    </>
  );
}
