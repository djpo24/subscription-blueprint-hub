import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Package2 } from 'lucide-react';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';

interface BultoLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bulto: any;
}

export function BultoLabelDialog({ open, onOpenChange, bulto }: BultoLabelDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Etiqueta de Bulto #{bulto.bulto_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div 
            className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-lg"
            style={{ 
              width: `${LABEL_DIMENSIONS.pageWidth}mm`, 
              height: `${LABEL_DIMENSIONS.pageHeight}mm`,
              padding: `${LABEL_DIMENSIONS.startY}mm ${LABEL_DIMENSIONS.startX}mm`
            }}
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <Package2 className="h-16 w-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold text-foreground">BULTO</h2>
              </div>

              {/* Número de Bulto Grande */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[120px] font-black leading-none text-primary">
                  #{bulto.bulto_number}
                </p>
              </div>

              {/* Información del Viaje */}
              {bulto.trips && (
                <div className="text-center space-y-2 border-t-2 border-border pt-6 w-full">
                  <div className="text-xl font-bold text-foreground">
                    {bulto.trips.origin} → {bulto.trips.destination}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(bulto.trips.trip_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}

              {/* Total de Paquetes */}
              <div className="bg-primary/10 rounded-lg px-6 py-3 border-2 border-primary/20">
                <p className="text-2xl font-bold text-primary">
                  {bulto.total_packages} {bulto.total_packages === 1 ? 'paquete' : 'paquetes'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full" size="lg">
            <Printer className="h-5 w-5 mr-2" />
            Imprimir Etiqueta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
