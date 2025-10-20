import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Gift, AlertCircle, Package as PackageIcon } from 'lucide-react';
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

interface Package {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  amount_to_collect: number;
  currency: string;
  weight: number;
}

export function RedemptionModal({ customer, isOpen, onClose }: RedemptionModalProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [pricePerKilo, setPricePerKilo] = useState('');
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && customer) {
      setStep('request');
      setPointsToRedeem('');
      setVerificationCode('');
      setRedemptionId(null);
      setSelectedPackageId('');
      setPricePerKilo('');
      fetchAvailablePoints();
      fetchAvailablePackages();
    }
  }, [isOpen, customer]);

  const fetchAvailablePackages = async () => {
    if (!customer) return;

    try {
      const { data: packages, error } = await supabase
        .from('packages')
        .select(`
          id, 
          tracking_number, 
          description, 
          status, 
          amount_to_collect, 
          currency, 
          weight,
          trips!inner(status)
        `)
        .eq('customer_id', customer.id)
        .in('status', ['pending', 'recibido', 'procesado', 'en_destino'])
        .eq('trips.status', 'scheduled')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📦 Available packages for redemption (scheduled trips only):', packages);
      setAvailablePackages(packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Error al cargar paquetes disponibles');
    }
  };

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
          const weightPoints = weight > 1 ? (weight - 1) * 10 : 0;
          return sum + 50 + weightPoints; // 50 base + 10 per additional kilo
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

    if (points < 1000) {
      toast.error('Mínimo 1,000 puntos para redimir (1 kilo)');
      return;
    }

    if (points % 1000 !== 0) {
      toast.error('Solo puedes redimir múltiplos de 1,000 puntos (1,000 / 2,000 / 3,000, etc.)');
      return;
    }

    if (points > availablePoints) {
      toast.error(`El cliente solo tiene ${availablePoints} puntos disponibles`);
      return;
    }

    if (!selectedPackageId) {
      toast.error('Debes seleccionar un paquete para aplicar el descuento');
      return;
    }

    const pricePerKiloNum = parseFloat(pricePerKilo);
    if (isNaN(pricePerKiloNum) || pricePerKiloNum <= 0) {
      toast.error('Ingresa un precio válido por kilo');
      return;
    }

    const kilos = points / 1000;
    const discountAmount = kilos * pricePerKiloNum;
    
    const selectedPackage = availablePackages.find(p => p.id === selectedPackageId);
    if (selectedPackage && discountAmount > selectedPackage.amount_to_collect) {
      toast.error('El descuento no puede ser mayor al monto a cobrar del paquete');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-redemption-code', {
        body: {
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          pointsToRedeem: points,
          kilosEarned: kilos,
          packageId: selectedPackageId,
          pricePerKilo: pricePerKiloNum,
          discountAmount: discountAmount,
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

      // Apply discount to package
      if (redemption.package_id && redemption.discount_amount) {
        const { data: packageData, error: packageFetchError } = await supabase
          .from('packages')
          .select('amount_to_collect, discount_applied')
          .eq('id', redemption.package_id)
          .single();

        if (packageFetchError) throw packageFetchError;

        const newAmountToCollect = Math.max(0, packageData.amount_to_collect - redemption.discount_amount);
        const newDiscountApplied = (packageData.discount_applied || 0) + redemption.discount_amount;

        const { error: packageUpdateError } = await supabase
          .from('packages')
          .update({
            amount_to_collect: newAmountToCollect,
            discount_applied: newDiscountApplied,
          })
          .eq('id', redemption.package_id);

        if (packageUpdateError) throw packageUpdateError;

        toast.success(`¡Redención exitosa! ${redemption.kilos_earned} kg = ƒ${redemption.discount_amount} descuento aplicado`);
      } else {
        toast.success(`¡Redención exitosa! ${redemption.kilos_earned} kg acreditados`);
      }
      
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
                <Label htmlFor="package">Aplicar descuento al paquete</Label>
                <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackages.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay paquetes disponibles
                      </SelectItem>
                    ) : (
                      availablePackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex items-center gap-2">
                            <PackageIcon className="h-3 w-3" />
                            <span className="font-mono text-xs">{pkg.tracking_number}</span>
                            <span className="text-xs text-muted-foreground">
                              {pkg.currency === 'AWG' ? 'ƒ' : '$'}{pkg.amount_to_collect.toLocaleString()} - {pkg.weight}kg
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Solo se muestran paquetes en viajes programados (Pendiente, Recibido, Procesado, En Destino)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerKilo">Precio por kilo (AWG)</Label>
                <Input
                  id="pricePerKilo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricePerKilo}
                  onChange={(e) => setPricePerKilo(e.target.value)}
                  placeholder="Ej: 15.00"
                />
              </div>

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
                    ? parseInt(pointsToRedeem) % 1000 === 0
                      ? `= ${parseInt(pointsToRedeem) / 1000} kg`
                      : '❌ Debe ser múltiplo de 1,000'
                    : 'Solo múltiplos de 1,000 puntos (1,000 / 2,000 / 3,000, etc.)'}
                </p>
              </div>

              {pointsToRedeem && pricePerKilo && parseInt(pointsToRedeem) >= 1000 && parseInt(pointsToRedeem) % 1000 === 0 && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
                  <Gift className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-semibold text-green-700 dark:text-green-400">
                      Descuento a aplicar: ƒ{((parseInt(pointsToRedeem) / 1000) * parseFloat(pricePerKilo)).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {parseInt(pointsToRedeem) / 1000} kg × ƒ{parseFloat(pricePerKilo).toFixed(2)} por kilo
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRequestRedemption}
                disabled={isLoading || !pointsToRedeem || !selectedPackageId || !pricePerKilo}
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
