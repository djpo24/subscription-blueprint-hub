
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportContactsDialog({ open, onOpenChange }: ImportContactsDialogProps) {
  const { toast } = useToast();

  const handleImport = () => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La funcionalidad de importar contactos estará disponible pronto",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Contactos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Arrastra y suelta un archivo CSV o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500">
              Formato: Nombre, Teléfono, Notas
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>
              Importar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
