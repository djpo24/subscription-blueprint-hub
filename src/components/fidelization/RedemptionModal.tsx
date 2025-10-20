import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Gift, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface RedemptionModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RedemptionModal({ customer, isOpen, onClose }: RedemptionModalProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && customer) {
      setStep('request');
      setPointsToRedeem('');
      setVerificationCode('');
      setRedemptionId(null);
      fetchAvailablePoints();
    }
  }, [isOpen, customer]);

  const fetchAvailablePoints = async () => {
    if (!customer) return;

    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: packages, error } = await supabase
        .from('packages')
        .select(`
          id,
          weight,
          status,
          created_at,
          customer_payments (id, amount)
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gte('created_at', oneYearAgo.toISOString());

      if (error) throw error;

      // Calculate total points from last year
      const totalPoints = packages
        .filter(pkg => pkg.customer_payments && pkg.customer_payments.length > 0)
        .reduce((sum, pkg) => {
          const weight = pkg.weight || 0;
          return sum + 60 + (weight * 10); // 60 base + 10 per kilo
        }, 0);

      // Get redeemed points
      const { data: redemptions, error: redemptionError } = await supabase
        .from('point_redemptions')
        .select('points_redeemed')
        .eq('customer_id', customer.id)
        .eq('status', 'verified');

      if (redemptionError) throw redemptionError;

      const redeemedPoints = redemptions.reduce((sum, r) => sum + r.points_redeemed, 0);
      
      setAvailablePoints(Math.max(0, totalPoints - redeemedPoints));
    } catch (error) {
      console.error('Error fetching points:', error);
      toast.error('Error al cargar puntos disponibles');
    }
  };

  const handleRequestRedemption = async () => {
    if (!customer) return;

    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      toast.error('Ingresa una cantidad válida de puntos');
      return;
    }

    if (points > availablePoints) {
      toast.error(`El cliente solo tiene ${availablePoints} puntos disponibles`);
      return;
    }

    if (points < 1000) {
      toast.error('Mínimo 1,000 puntos para redimir (1 kilo)');
      return;
    }

    const kilos = Math.floor(points / 1000);

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-redemption-code', {
        body: {
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          pointsToRedeem: points,
          kilosEarned: kilos,
        },
      });

      if (error) throw error;

      setRedemptionId(data.redemptionId);
      setStep('verify');
      toast.success('Código enviado por WhatsApp');
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error('Error al enviar código de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!redemptionId || verificationCode.length !== 4) {
      toast.error('Ingresa el código de 4 dígitos');
      return;
    }

    setIsLoading(true);
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
        toast.error('El código ha expirado. Solicita uno nuevo.');
        await supabase
          .from('point_redemptions')
          .update({ status: 'expired' })
          .eq('id', redemptionId);
        setStep('request');
        setVerificationCode('');
        return;
      }

      // Verify code
      if (redemption.verification_code !== verificationCode) {
        toast.error('Código incorrecto. Intenta nuevamente.');
        return;
      }

      // Update redemption as verified
      const { error: updateError } = await supabase
        .from('point_redemptions')
        .update({
          status: 'verified',
          code_verified_at: new Date().toISOString(),
        })
        .eq('id', redemptionId);

      if (updateError) throw updateError;

      toast.success(`¡Redención exitosa! ${redemption.kilos_earned} kg acreditados`);
      onClose();
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Redimir Puntos - {customer?.name}
          </DialogTitle>
          <DialogDescription>
            {step === 'request'
              ? 'Ingresa la cantidad de puntos a redimir'
              : 'Ingresa el código enviado por WhatsApp'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'request' ? (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Puntos disponibles: <strong>{availablePoints.toLocaleString()}</strong>
                  <br />
                  Kilos disponibles: <strong>{Math.floor(availablePoints / 1000)} kg</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="points">Puntos a redimir</Label>
                <Input
                  id="points"
                  type="number"
                  min="1000"
                  step="1000"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder="1000"
                />
                <p className="text-sm text-muted-foreground">
                  {pointsToRedeem && parseInt(pointsToRedeem) >= 1000
                    ? `= ${Math.floor(parseInt(pointsToRedeem) / 1000)} kg`
                    : 'Mínimo 1,000 puntos (1 kg)'}
                </p>
              </div>

              <Button
                onClick={handleRequestRedemption}
                disabled={isLoading || !pointsToRedeem}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  'Enviar código por WhatsApp'
                )}
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Se ha enviado un código de 4 dígitos al WhatsApp del cliente.
                  <br />
                  El código expira en 10 minutos.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('request');
                    setVerificationCode('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 4}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar código'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
