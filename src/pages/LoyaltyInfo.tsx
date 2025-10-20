import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Star, Gift, Calendar, Package, Shield, Trophy, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export default function LoyaltyInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Programa de Fidelización</h1>
            <p className="text-lg text-muted-foreground">
              Gana puntos con cada envío y canjéalos por kilos gratis
            </p>
          </div>
        </div>

        {/* Main Benefits */}
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Beneficios del Programa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Acumula Puntos</h3>
                <p className="text-sm text-muted-foreground">
                  Por cada envío que realices
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
                  <Gift className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Canjea Kilos</h3>
                <p className="text-sm text-muted-foreground">
                  Usa tus puntos para envíos gratis
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-3">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Recompensas</h3>
                <p className="text-sm text-muted-foreground">
                  Más envíos, más beneficios
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">¿Cómo Funciona?</CardTitle>
            <CardDescription>Sistema simple y transparente de acumulación de puntos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Point Calculation */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Acumulación de Puntos
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Base</Badge>
                  <div>
                    <p className="font-medium">50 puntos por cada envío</p>
                    <p className="text-sm text-muted-foreground">
                      Recibes 50 puntos automáticamente por cada paquete enviado
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Peso</Badge>
                  <div>
                    <p className="font-medium">10 puntos por kilo adicional</p>
                    <p className="text-sm text-muted-foreground">
                      Después del primer kilo, ganas 10 puntos extra por cada kilo adicional
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-background rounded-lg p-4 border-2 border-primary/20">
                  <p className="font-semibold mb-2">📊 Ejemplos de Cálculo:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>1 kilo:</strong> 50 puntos (solo base)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>2 kilos:</strong> 60 puntos (50 base + 10 por 1 kilo adicional)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>5 kilos:</strong> 90 puntos (50 base + 40 por 4 kilos adicionales)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span><strong>10 kilos:</strong> 140 puntos (50 base + 90 por 9 kilos adicionales)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Redemption */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                Canjeo de Puntos
              </h3>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                <p className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">
                  1,000 puntos = 1 kilo gratis
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Canjea tus puntos acumulados por kilos que podrás usar en tus próximos envíos
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Mínimo 1,000 puntos para canjear (1 kilo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Código de verificación enviado por WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Canje inmediato una vez verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Requisitos Importantes</CardTitle>
            <CardDescription>Condiciones para acumular y mantener tus puntos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Envío Entregado</p>
                <p className="text-sm text-muted-foreground">
                  El paquete debe estar en estado "Entregado" para acumular puntos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Pago Completo</p>
                <p className="text-sm text-muted-foreground">
                  El envío debe estar completamente pagado para ser elegible
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Validez de Puntos: 1 Año</p>
                <p className="text-sm text-muted-foreground">
                  Solo se cuentan envíos realizados en el último año calendario. Los puntos se pierden después de 12 meses.
                </p>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-1">
                ⚠️ Importante sobre la expiración
              </p>
              <p className="text-sm text-muted-foreground">
                Los puntos tienen vigencia de un año desde la fecha del envío. Si no canjeas tus puntos dentro de este período, los puntos de ese envío expirarán automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Process */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Proceso de Canjeo</CardTitle>
            <CardDescription>Pasos simples para canjear tus puntos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Solicita tu canje</p>
                  <p className="text-sm text-muted-foreground">
                    Contacta con nosotros o usa el panel de fidelización para solicitar el canje de tus puntos
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Recibe código de verificación</p>
                  <p className="text-sm text-muted-foreground">
                    Te enviaremos un código de 4 dígitos por WhatsApp (válido por 10 minutos)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Verifica y confirma</p>
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código de verificación para completar el canje
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">¡Disfruta tus kilos gratis!</p>
                  <p className="text-sm text-muted-foreground">
                    Usa tus kilos canjeados en tu próximo envío
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions that Don't Count */}
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              No Acumulan Puntos
            </CardTitle>
            <CardDescription>Situaciones en las que no se otorgan puntos</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Envíos no entregados o en tránsito</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Envíos sin pago completado</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Envíos realizados hace más de un año</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Envíos cancelados o devueltos</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              Seguridad y Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tu seguridad es nuestra prioridad. Todos los canjes requieren verificación mediante código WhatsApp para proteger tus puntos.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>Código único de 4 dígitos por cada canje</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>Caducidad del código: 10 minutos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>Verificación obligatoria antes de completar el canje</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90"
          >
            ¡Empieza a Acumular Puntos!
          </Button>
        </div>
      </div>
    </div>
  );
}
