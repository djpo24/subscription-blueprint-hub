
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, AlertTriangle, Eye, EyeOff, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppTokenConfig() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showTokens, setShowTokens] = useState({
    accessToken: false,
    verifyToken: false,
    phoneNumberId: false
  });

  const [tokens, setTokens] = useState({
    accessToken: '',
    verifyToken: '',
    phoneNumberId: ''
  });

  const [tokenStatus, setTokenStatus] = useState({
    accessToken: 'unknown',
    verifyToken: 'unknown',
    phoneNumberId: 'unknown'
  });

  const webhookUrl = 'WEBHOOK ELIMINADO - Sin procesamiento automático';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  const validateTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-meta-connection', {
        body: { testType: 'token_validation' }
      });

      if (error) throw error;

      if (data.success) {
        setTokenStatus(prev => ({ ...prev, accessToken: 'valid' }));
        toast({
          title: "Token de acceso válido",
          description: "El token de acceso de Meta está funcionando correctamente"
        });
      } else {
        setTokenStatus(prev => ({ ...prev, accessToken: 'invalid' }));
        toast({
          title: "Token de acceso inválido",
          description: data.error || "El token de acceso no es válido",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error validating tokens:', error);
      setTokenStatus(prev => ({ ...prev, accessToken: 'error' }));
      toast({
        title: "Error de validación",
        description: "No se pudo validar el token de acceso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAccessToken = async () => {
    if (!tokens.accessToken) {
      toast({
        title: "Error",
        description: "Por favor ingresa un token de acceso válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('update-meta-token', {
        body: { token: tokens.accessToken }
      });

      if (error) throw error;

      toast({
        title: "Token actualizado",
        description: "Token de acceso ha sido actualizado correctamente",
      });

      // Validate the new token
      await validateTokens();
    } catch (error: any) {
      console.error('Error updating access token:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el token de acceso: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePhoneNumberId = async () => {
    if (!tokens.phoneNumberId) {
      toast({
        title: "Error",
        description: "Por favor ingresa un Phone Number ID válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Actualizando Phone Number ID:', tokens.phoneNumberId);
      
      const { error } = await supabase.rpc('update_app_secret', {
        secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID',
        secret_value: tokens.phoneNumberId
      });

      if (error) {
        console.error('Error RPC updatePhoneNumberId:', error);
        throw error;
      }

      console.log('Phone Number ID actualizado exitosamente');
      setTokenStatus(prev => ({ ...prev, phoneNumberId: 'valid' }));
      toast({
        title: "Phone Number ID actualizado",
        description: "Phone Number ID ha sido actualizado correctamente",
      });
    } catch (error: any) {
      console.error('Error updating phone number ID:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el Phone Number ID: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerifyToken = async () => {
    if (!tokens.verifyToken) {
      toast({
        title: "Error",
        description: "Por favor ingresa un token de verificación válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Actualizando Verify Token:', tokens.verifyToken);
      
      const { error } = await supabase.rpc('update_app_secret', {
        secret_name: 'META_WHATSAPP_VERIFY_TOKEN',
        secret_value: tokens.verifyToken
      });

      if (error) {
        console.error('Error RPC updateVerifyToken:', error);
        throw error;
      }

      console.log('Verify Token actualizado exitosamente');
      setTokenStatus(prev => ({ ...prev, verifyToken: 'valid' }));
      toast({
        title: "Token de verificación actualizado",
        description: "Token de verificación ha sido actualizado correctamente",
      });
    } catch (error: any) {
      console.error('Error updating verify token:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el token de verificación: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-800">Inválido</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">No verificado</Badge>;
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 1: Verificar Configuración Actual</h3>
            <p className="text-sm text-gray-600">
              Primero vamos a verificar el estado actual de tus tokens de WhatsApp.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tokenStatus.accessToken)}
                  <span className="font-medium">Token de Acceso</span>
                </div>
                {getStatusBadge(tokenStatus.accessToken)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tokenStatus.verifyToken)}
                  <span className="font-medium">Token de Verificación</span>
                </div>
                {getStatusBadge(tokenStatus.verifyToken)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tokenStatus.phoneNumberId)}
                  <span className="font-medium">Phone Number ID</span>
                </div>
                {getStatusBadge(tokenStatus.phoneNumberId)}
              </div>
            </div>

            <Button onClick={validateTokens} disabled={loading} className="w-full">
              {loading ? 'Verificando...' : 'Verificar Tokens'}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 2: Obtener Tokens de Meta</h3>
            <p className="text-sm text-gray-600">
              Necesitas obtener los tokens correctos desde Meta Developer Console.
            </p>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Necesitas tener acceso a Meta Developer Console y tu aplicación de WhatsApp Business.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">📱 Token de Acceso (Access Token)</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Ve a Meta Developer Console → Tu App → WhatsApp → API Setup
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Meta Developer Console
                </Button>
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">🔐 Token de Verificación</h4>
                <p className="text-sm text-gray-600">
                  Puedes usar cualquier cadena de texto. Recomendamos: <code>ojitos_webhook_verify</code>
                </p>
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">📞 Phone Number ID</h4>
                <p className="text-sm text-gray-600">
                  Se encuentra en la misma página de API Setup, en la sección "Phone numbers"
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 3: Configurar Tokens</h3>
            <p className="text-sm text-gray-600">
              Ingresa los tokens que obtuviste de Meta Developer Console.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accessToken">Token de Acceso</Label>
                <div className="flex gap-2">
                  <Input
                    id="accessToken"
                    type={showTokens.accessToken ? "text" : "password"}
                    placeholder="EAAxxxxxxxxxxxxx..."
                    value={tokens.accessToken}
                    onChange={(e) => setTokens(prev => ({ ...prev, accessToken: e.target.value }))}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTokens(prev => ({ ...prev, accessToken: !prev.accessToken }))}
                  >
                    {showTokens.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={updateAccessToken}
                  disabled={loading || !tokens.accessToken}
                  className="w-full mt-2"
                  size="sm"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Token de Acceso'}
                </Button>
              </div>

              <div>
                <Label htmlFor="verifyToken">Token de Verificación</Label>
                <div className="flex gap-2">
                  <Input
                    id="verifyToken"
                    type={showTokens.verifyToken ? "text" : "password"}
                    placeholder="ojitos_webhook_verify"
                    value={tokens.verifyToken}
                    onChange={(e) => setTokens(prev => ({ ...prev, verifyToken: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTokens(prev => ({ ...prev, verifyToken: !prev.verifyToken }))}
                  >
                    {showTokens.verifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={updateVerifyToken}
                  disabled={loading || !tokens.verifyToken}
                  className="w-full mt-2"
                  size="sm"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Token de Verificación'}
                </Button>
              </div>

              <div>
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumberId"
                    type={showTokens.phoneNumberId ? "text" : "password"}
                    placeholder="123456789012345"
                    value={tokens.phoneNumberId}
                    onChange={(e) => setTokens(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTokens(prev => ({ ...prev, phoneNumberId: !prev.phoneNumberId }))}
                  >
                    {showTokens.phoneNumberId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={updatePhoneNumberId}
                  disabled={loading || !tokens.phoneNumberId}
                  className="w-full mt-2"
                  size="sm"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Phone Number ID'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 4: Configurar Webhook en Meta</h3>
            <p className="text-sm text-gray-600">
              Ahora configura el webhook en Meta Developer Console con la nueva URL V3.
            </p>

            <div className="space-y-4">
              <div className="p-3 border rounded bg-emerald-50 border-emerald-200">
                <h4 className="font-medium mb-2 text-emerald-800">📡 Nueva URL del Webhook V3</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border font-mono break-all text-emerald-700">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl, 'URL del webhook')}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded bg-gray-50">
                <h4 className="font-medium mb-2">🔐 Token de Verificación</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border">
                    {tokens.verifyToken || 'ojitos_webhook_verify'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tokens.verifyToken || 'ojitos_webhook_verify', 'Token de verificación')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 border rounded bg-blue-50">
                <h4 className="font-medium mb-2">📋 Pasos en Meta Developer Console:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Ve a tu aplicación → WhatsApp → Configuration</li>
                  <li>En "Webhook", haz clic en "Edit"</li>
                  <li>Reemplaza la URL anterior con la nueva URL V3 de arriba</li>
                  <li>Pega el token de verificación</li>
                  <li>Selecciona "messages" en Webhook fields</li>
                  <li>Haz clic en "Verify and save"</li>
                </ol>
              </div>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Meta Developer Console
              </Button>

              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700">
                  <strong>✅ Webhook V3 Actualizado:</strong> Esta nueva URL reemplaza cualquier webhook anterior. 
                  Una vez configurada en Meta, el webhook estará completamente funcional.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Tokens WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Tokens WhatsApp</DialogTitle>
          <DialogDescription>
            Configuremos los tokens de WhatsApp paso a paso para solucionar el problema del webhook.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === step
                    ? 'bg-blue-600 text-white'
                    : stepNumber < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Paso {step} de 4
          </div>
        </div>

        {renderStep()}

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={step === 1}
          >
            Anterior
          </Button>
          <div className="flex gap-2">
            {step < 4 && (
              <Button onClick={nextStep}>
                Siguiente
              </Button>
            )}
            {step === 4 && (
              <Button onClick={() => setIsOpen(false)}>
                Finalizar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
