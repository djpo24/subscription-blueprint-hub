
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouteFreightRates } from '@/hooks/useRouteFreightRates';
import { useUpdateRouteFreightRate } from '@/hooks/useUpdateRouteFreightRate';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RouteRate {
  id: string;
  origin: string;
  destination: string;
  price_per_kilo: number;
  currency: string;
  effective_from: string;
  effective_until?: string;
  notes?: string;
}

export function FreightRatesManager() {
  const { data: rates = [], isLoading } = useRouteFreightRates();
  const { mutateAsync: updateRate, isPending } = useUpdateRouteFreightRate();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RouteRate | null>(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    pricePerKilo: '',
    currency: 'COP',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveUntil: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRate({
        id: editingRate?.id,
        origin: formData.origin,
        destination: formData.destination,
        pricePerKilo: parseFloat(formData.pricePerKilo),
        currency: formData.currency,
        effectiveFrom: formData.effectiveFrom,
        effectiveUntil: formData.effectiveUntil || undefined,
        notes: formData.notes
      });

      toast({
        title: editingRate ? "Tarifa actualizada" : "Tarifa creada",
        description: `La tarifa para ${formData.origin} → ${formData.destination} ha sido ${editingRate ? 'actualizada' : 'creada'} exitosamente`,
      });

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la tarifa",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingRate(null);
    setFormData({
      origin: '',
      destination: '',
      pricePerKilo: '',
      currency: 'COP',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveUntil: '',
      notes: ''
    });
  };

  const handleEdit = (rate: RouteRate) => {
    setEditingRate(rate);
    setFormData({
      origin: rate.origin,
      destination: rate.destination,
      pricePerKilo: rate.price_per_kilo.toString(),
      currency: rate.currency,
      effectiveFrom: rate.effective_from,
      effectiveUntil: rate.effective_until || '',
      notes: rate.notes || ''
    });
    setDialogOpen(true);
  };

  const handleNewRate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'COP') {
      return `$${amount.toLocaleString()} pesos`;
    } else if (currency === 'AWG') {
      return `ƒ${amount} florines`;
    }
    return `${amount} ${currency}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarifas de Flete por Ruta
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewRate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva tarifa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingRate ? 'Editar Tarifa' : 'Nueva Tarifa'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origen</Label>
                      <Select value={formData.origin} onValueChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                          <SelectItem value="Curazao">Curazao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destino</Label>
                      <Select value={formData.destination} onValueChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                          <SelectItem value="Curazao">Curazao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio por kg</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.pricePerKilo}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerKilo: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COP">COP (Pesos)</SelectItem>
                          <SelectItem value="AWG">AWG (Florines)</SelectItem>
                          <SelectItem value="USD">USD (Dólares)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="effectiveFrom">Vigente desde</Label>
                      <Input
                        id="effectiveFrom"
                        type="date"
                        value={formData.effectiveFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effectiveUntil">Vigente hasta (opcional)</Label>
                      <Input
                        id="effectiveUntil"
                        type="date"
                        value={formData.effectiveUntil}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveUntil: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isPending}>
                      {isPending ? 'Guardando...' : (editingRate ? 'Actualizar' : 'Crear')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Precio/kg</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <span className="font-medium">{rate.origin} → {rate.destination}</span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(rate.price_per_kilo, rate.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Desde: {new Date(rate.effective_from).toLocaleDateString()}</div>
                        {rate.effective_until && (
                          <div>Hasta: {new Date(rate.effective_until).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{rate.notes || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rate)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No hay tarifas configuradas. Crea la primera tarifa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
