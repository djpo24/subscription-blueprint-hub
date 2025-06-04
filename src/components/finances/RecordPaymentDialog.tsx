
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    customer_name: string;
    phone: string;
    total_pending_amount: number;
    package_numbers: string;
  } | null;
  onPaymentRecorded: () => void;
}

export function RecordPaymentDialog({ 
  isOpen, 
  onClose, 
  customer, 
  onPaymentRecorded 
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [currency, setCurrency] = useState('COP');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !amount) return;

    setIsLoading(true);

    try {
      // Get the first package ID for this customer (simplified approach)
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0)
        .limit(1);

      if (packagesError) throw packagesError;
      if (!packages || packages.length === 0) {
        throw new Error('No se encontraron paquetes para este cliente');
      }

      const { error } = await supabase
        .from('customer_payments')
        .insert({
          customer_id: customer.id,
          package_id: packages[0].id,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          currency,
          notes: notes || null,
          created_by: 'Usuario actual' // TODO: Replace with actual user
        });

      if (error) throw error;

      toast({
        title: 'Pago registrado',
        description: `Se registró un pago de ${currency} ${amount} para ${customer.customer_name}`,
      });

      onPaymentRecorded();
      onClose();
      setAmount('');
      setNotes('');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{customer.customer_name}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              <div className="mt-2">
                <Badge variant="outline">
                  Pendiente: {formatCurrency(customer.total_pending_amount)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={customer.total_pending_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COP">COP (Pesos)</SelectItem>
                  <SelectItem value="AWG">AWG (Florín)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre el pago..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
