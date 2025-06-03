
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useDeliverPackage } from '@/hooks/useDeliverPackage';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobileDeliveryFormProps {
  package: PackageInDispatch;
  onDeliveryComplete: () => void;
  onCancel: () => void;
}

export function MobileDeliveryForm({ 
  package: pkg, 
  onDeliveryComplete, 
  onCancel 
}: MobileDeliveryFormProps) {
  const [deliveredBy, setDeliveredBy] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  const deliverPackage = useDeliverPackage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveredBy.trim()) {
      alert('Por favor ingresa el nombre de quien entrega');
      return;
    }

    try {
      await deliverPackage.mutateAsync({
        packageId: pkg.id,
        deliveredBy: deliveredBy.trim(),
        // For mobile delivery, we'll deliver without payment for now
        // This can be enhanced later to include payment options
      });

      alert('¡Paquete entregado exitosamente!');
      onDeliveryComplete();
    } catch (error) {
      console.error('Error delivering package:', error);
      alert('Error al entregar el paquete. Intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Package Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {pkg.tracking_number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Cliente:</span>
              <span>{pkg.customers?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Destino:</span>
              <span>{pkg.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Descripción:</span>
              <span className="text-right">{pkg.description}</span>
            </div>
            {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-600">Monto a cobrar:</span>
                <span className="font-bold text-green-600">
                  ${pkg.amount_to_collect.toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Form */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmar Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Delivered By */}
            <div>
              <Label htmlFor="deliveredBy">Entregado por *</Label>
              <Input
                id="deliveredBy"
                value={deliveredBy}
                onChange={(e) => setDeliveredBy(e.target.value)}
                placeholder="Nombre de quien entrega"
                required
                className="mt-1"
              />
            </div>

            {/* Notes Section */}
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="mb-2 w-full justify-between"
              >
                <span>Agregar notas (opcional)</span>
                {showNotes ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {showNotes && (
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Amount to Collect Warning */}
            {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <p className="text-sm text-orange-700">
                    <strong>Importante:</strong> Este paquete tiene un monto a cobrar de{' '}
                    <strong>${pkg.amount_to_collect.toLocaleString('es-CO')}</strong>.
                    Asegúrate de cobrarlo antes de confirmar la entrega.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!deliveredBy.trim() || deliverPackage.isPending}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                {deliverPackage.isPending ? 'Entregando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
