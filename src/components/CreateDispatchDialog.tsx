
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateDispatch } from '@/hooks/useDispatchRelations';
import { Package, Truck, Weight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PackageInfo {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface CreateDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  packages: PackageInfo[];
  onSuccess?: () => void;
}

export function CreateDispatchDialog({ 
  open, 
  onOpenChange, 
  date, 
  packages, 
  onSuccess 
}: CreateDispatchDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const createDispatch = useCreateDispatch();

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(packages.map(pkg => pkg.id));
    }
  };

  const selectedPackagesData = packages.filter(pkg => selectedPackages.includes(pkg.id));
  const totals = selectedPackagesData.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPackages.length === 0) return;

    try {
      await createDispatch.mutateAsync({
        date,
        packageIds: selectedPackages,
        notes: notes.trim() || undefined
      });
      
      setSelectedPackages([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating dispatch:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Crear Despacho para {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de paquetes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">
                Seleccionar Encomiendas ({packages.length} disponibles)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedPackages.length === packages.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </Button>
            </div>

            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {packages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No hay encomiendas disponibles para este día
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        id={pkg.id}
                        checked={selectedPackages.includes(pkg.id)}
                        onCheckedChange={(checked) => 
                          handlePackageToggle(pkg.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {pkg.tracking_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pkg.customers?.name || 'Sin cliente'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {pkg.weight || 0} kg
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            ${pkg.freight || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${pkg.amount_to_collect || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          {selectedPackages.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Resumen del Despacho
              </h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Paquetes</div>
                    <div className="font-bold">{selectedPackages.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Peso Total</div>
                    <div className="font-bold">{totals.weight} kg</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Flete Total</div>
                    <div className="font-bold">${totals.freight}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-green-600">A Cobrar</div>
                    <div className="font-bold text-green-700">${totals.amount_to_collect}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre este despacho..."
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={selectedPackages.length === 0 || createDispatch.isPending}
            >
              {createDispatch.isPending ? 'Creando...' : 'Crear Despacho'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
