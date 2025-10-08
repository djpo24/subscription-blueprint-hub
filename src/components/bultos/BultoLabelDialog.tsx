import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

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
            className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-card"
            style={{ width: '10cm', height: '15cm' }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-6xl font-bold mb-4">#{bulto.bulto_number}</p>
              <p className="text-lg font-medium">BULTO</p>
              {bulto.trips && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>{bulto.trips.origin} → {bulto.trips.destination}</p>
                  <p>{new Date(bulto.trips.trip_date).toLocaleDateString()}</p>
                </div>
              )}
              <p className="mt-4 text-sm">
                {bulto.total_packages} paquetes
              </p>
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Etiqueta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
