
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { DollarSign, User, Phone, Package, Check, X } from 'lucide-react';

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
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [currency, setCurrency] = useState('COP');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  const formatNumberDisplay = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    // Add thousands separators (periods)
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Store cursor position
    const cursorPosition = e.target.selectionStart;
    
    // Remove all non-digit characters for raw value
    const numbers = inputValue.replace(/\D/g, '');
    setRawAmount(numbers);
    
    // Format for display
    const formatted = formatNumberDisplay(numbers);
    
    // Update the input value directly to avoid re-render issues
    if (inputRef.current) {
      inputRef.current.value = formatted;
      
      // Restore cursor position, accounting for added separators
      setTimeout(() => {
        if (inputRef.current && cursorPosition !== null) {
          const newCursorPos = Math.min(cursorPosition, formatted.length);
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !rawAmount) return;

    const numericAmount = parseFloat(rawAmount);
    if (!numericAmount || numericAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un monto válido',
        variant: 'destructive',
      });
      return;
    }

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
          amount: numericAmount,
          payment_method: paymentMethod,
          currency,
          notes: notes || null,
          created_by: 'Usuario actual' // TODO: Replace with actual user
        });

      if (error) throw error;

      const formattedDisplay = formatNumberDisplay(rawAmount);
      toast({
        title: 'Pago registrado',
        description: `Se registró un pago de ${currency} ${formattedDisplay} para ${customer.customer_name}`,
      });

      onPaymentRecorded();
      onClose();
      setRawAmount('');
      setNotes('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
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

  // Calculate remaining amount dynamically
  const enteredAmount = rawAmount ? parseFloat(rawAmount) : 0;
  const remainingAmount = Math.max(0, (customer?.total_pending_amount || 0) - enteredAmount);

  if (!customer) return null;

  const PaymentContent = () => (
    <div className="space-y-4">
      {/* Customer Info Card - Exact style from MobilePackageInfo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">{customer.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-mono text-sm">{customer.package_numbers}</span>
          </div>
          <div className="pt-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Total: {formatCurrency(customer.total_pending_amount)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form - Exact style from MobilePaymentSection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Registrar Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  ref={inputRef}
                  id="amount"
                  type="text"
                  onChange={handleAmountChange}
                  placeholder="0"
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

            {/* Dynamic Payment Summary - Same style as MobileDeliveryActions */}
            {enteredAmount > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total a cobrar:</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(customer.total_pending_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Monto ingresado:</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(enteredAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-2">
                      <span className="font-medium text-green-800">Pendiente:</span>
                      <span className={`font-bold ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Action Buttons - Exact style from MobileDeliveryActions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !rawAmount}
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                {isLoading ? 'Registrando...' : 'Registrar Pago'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-[95vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registrar Pago
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PaymentContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Registrar Pago
          </DialogTitle>
        </DialogHeader>
        <PaymentContent />
      </DialogContent>
    </Dialog>
  );
}
