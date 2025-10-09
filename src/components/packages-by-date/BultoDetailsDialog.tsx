import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Printer, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PDFBultoLabelService } from '@/services/pdfBultoLabelService';
import { toast } from 'sonner';
import { useState } from 'react';
import { DeleteBultoDialog } from '../bultos/DeleteBultoDialog';
import { useDeleteBulto } from '@/hooks/useDeleteBulto';

interface BultoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bulto: any;
  onUpdate: () => void;
}

export function BultoDetailsDialog({ open, onOpenChange, bulto, onUpdate }: BultoDetailsDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteBulto, isDeleting } = useDeleteBulto();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['bulto-packages', bulto.id],
    queryFn: async () => {
      // Get all labels for this bulto
      const { data: labels, error: labelsError } = await supabase
        .from('package_labels')
        .select('package_id')
        .eq('bulto_id', bulto.id);

      if (labelsError) throw labelsError;
      if (!labels || labels.length === 0) return [];

      const packageIds = labels.map(l => l.package_id);

      // Get packages details
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers!packages_customer_id_fkey(name, email, phone)
        `)
        .in('id', packageIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const handlePrintLabel = async () => {
    try {
      await PDFBultoLabelService.printPDF({
        id: bulto.id,
        bulto_number: bulto.bulto_number
      });
      toast.success('Etiqueta enviada a impresión');
    } catch (error) {
      console.error('Error al imprimir etiqueta de bulto:', error);
      toast.error('Error al generar la etiqueta');
    }
  };

  const handleDeleteBulto = async () => {
    const success = await deleteBulto(bulto.id);
    if (success) {
      setShowDeleteDialog(false);
      onOpenChange(false);
      onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Bulto #{bulto.bulto_number}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrintLabel}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Etiqueta
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={bulto.status === 'open' ? 'default' : 'secondary'}>
                    {bulto.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paquetes</p>
                  <p className="text-lg font-semibold">{bulto.total_packages}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado</p>
                  <p className="text-sm">
                    {new Date(bulto.created_at).toLocaleDateString()}
                  </p>
                </div>
                {bulto.notes && (
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm">{bulto.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Paquetes en este Bulto ({packages?.length || 0})
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="space-y-2">
                {packages.map((pkg, index) => (
                  <Card key={pkg.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-mono font-semibold">{pkg.tracking_number}</p>
                            <Badge variant="outline">{pkg.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cliente: {pkg.customers?.name}
                          </p>
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {pkg.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {pkg.weight && <span>Peso: {pkg.weight} kg</span>}
                            {pkg.freight && <span>Flete: ${pkg.freight}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay paquetes en este bulto</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DeleteBultoDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          bultoNumber={bulto.bulto_number}
          packages={packages || []}
          onConfirm={handleDeleteBulto}
          isDeleting={isDeleting}
        />
      </DialogContent>
    </Dialog>
  );
}
