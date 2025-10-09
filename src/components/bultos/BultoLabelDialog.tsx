import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
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
            className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-lg flex items-center justify-center print:border-0"
            style={{ 
              width: `${LABEL_DIMENSIONS.pageWidth}mm`, 
              height: `${LABEL_DIMENSIONS.pageHeight}mm`,
            }}
          >
            <p className="text-[180px] font-black leading-none text-foreground">
              {bulto.bulto_number}
            </p>
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
