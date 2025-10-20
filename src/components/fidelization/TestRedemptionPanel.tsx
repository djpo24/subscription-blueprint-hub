import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export function TestRedemptionPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [testPoints, setTestPoints] = useState('1000');
  const [sentCode, setSentCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);

  // Search customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers-search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data as Customer[];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSendTestCode = async () => {
    if (!selectedCustomer) {
      toast.error('Selecciona un cliente');
      return;
    }

    const points = parseInt(testPoints);
    if (isNaN(points) || points <= 0) {
      toast.error('Ingresa una cantidad válida de puntos');
      return;
    }

    if (points < 1000 || points % 1000 !== 0) {
      toast.error('Los puntos deben ser múltiplos de 1,000');
      return;
    }

    setIsSending(true);
    try {
      const kilos = points / 1000;

      const { data, error } = await supabase.functions.invoke('send-redemption-code', {
        body: {
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          pointsToRedeem: points,
          kilosEarned: kilos,
        },
      });

      if (error) throw error;

      // Get the verification code from the redemption record (for testing purposes)
      const { data: redemption, error: redemptionError } = await supabase
        .from('point_redemptions')
        .select('verification_code, id')
        .eq('id', data.redemptionId)
        .single();

      if (redemptionError) throw redemptionError;

      setSentCode(redemption.verification_code);
      setRedemptionId(data.redemptionId);
      toast.success(`Código enviado: ${redemption.verification_code}`);
    } catch (error: any) {
      console.error('Error sending test code:', error);
      toast.error(error.message || 'Error al enviar código de prueba');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!redemptionId) {
      toast.error('Primero debes enviar un código');
      return;
    }

    if (verificationInput.length !== 4) {
      toast.error('El código debe tener 4 dígitos');
      return;
    }

    try {
      // Get redemption
      const { data: redemption, error: fetchError } = await supabase
        .from('point_redemptions')
        .select('*')
        .eq('id', redemptionId)
        .single();

      if (fetchError) throw fetchError;

      // Check if expired
      if (new Date(redemption.expires_at) < new Date()) {
        toast.error('El código ha expirado');
        await supabase
          .from('point_redemptions')
          .update({ status: 'expired' })
          .eq('id', redemptionId);
        
        // Reset test
        setSentCode('');
        setVerificationInput('');
        setRedemptionId(null);
        return;
      }

      // Verify code
      if (redemption.verification_code !== verificationInput) {
        toast.error('❌ Código incorrecto');
        return;
      }

      // Update as verified (test mode)
      await supabase
        .from('point_redemptions')
        .update({
          status: 'verified',
          code_verified_at: new Date().toISOString(),
        })
        .eq('id', redemptionId);

      toast.success(`✅ Código correcto! ${redemption.kilos_earned} kg acreditados (modo prueba)`);
      
      // Reset test
      setSentCode('');
      setVerificationInput('');
      setRedemptionId(null);
      setTestPoints('1000');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Error al verificar código');
    }
  };

  const handleResetTest = () => {
    setSelectedCustomer(null);
    setTestPoints('1000');
    setSentCode('');
    setVerificationInput('');
    setRedemptionId(null);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <TestTube className="h-4 w-4" />
        <AlertDescription>
          <strong>Modo de Prueba:</strong> Esta función permite simular el proceso de redención de puntos sin afectar los datos reales del cliente.
          Se enviará un código real por WhatsApp usando la plantilla configurada.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              1. Seleccionar Cliente
            </CardTitle>
            <CardDescription>
              Busca un cliente para realizar la prueba
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar cliente</Label>
              <Input
                id="search"
                placeholder="Nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {customers.length > 0 && (
              <div className="space-y-2">
                {customers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant={selectedCustomer?.id === customer.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-xs opacity-70">{customer.phone}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {selectedCustomer && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Cliente seleccionado: <strong>{selectedCustomer.name}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Points Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              2. Configurar Prueba
            </CardTitle>
            <CardDescription>
              Define los puntos de prueba y envía el código
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="points">Puntos de prueba</Label>
              <Input
                id="points"
                type="number"
                min="1000"
                step="1000"
                value={testPoints}
                onChange={(e) => setTestPoints(e.target.value)}
                disabled={!selectedCustomer || !!sentCode}
              />
              <p className="text-sm text-muted-foreground">
                {testPoints && parseInt(testPoints) >= 1000
                  ? `= ${parseInt(testPoints) / 1000} kg`
                  : 'Mínimo 1,000 puntos (1 kg)'}
              </p>
            </div>

            <Button
              onClick={handleSendTestCode}
              disabled={!selectedCustomer || isSending || !!sentCode}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar código de prueba
                </>
              )}
            </Button>

            {sentCode && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Código enviado:</strong> {sentCode}
                  <br />
                  <span className="text-xs">Este código ha sido enviado por WhatsApp al cliente</span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Verification */}
      {sentCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              3. Verificar Código
            </CardTitle>
            <CardDescription>
              Ingresa el código recibido por WhatsApp para validar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification">Código de verificación</Label>
              <Input
                id="verification"
                type="text"
                maxLength={4}
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetTest}
                className="flex-1"
              >
                Reiniciar prueba
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={verificationInput.length !== 4}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Verificar código
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}