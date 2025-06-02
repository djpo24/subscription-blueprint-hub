
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, ExternalLink, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function TokenExpirationAlert() {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleOpenMetaDeveloper = () => {
    window.open('https://developers.facebook.com/apps', '_blank');
  };

  const handleUpdateToken = async () => {
    if (!newToken.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese el nuevo token",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-meta-token', {
        body: { token: newToken.trim() }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Token actualizado",
        description: "El token de WhatsApp ha sido actualizado correctamente",
      });

      setShowTokenDialog(false);
      setNewToken('');
      
      // Opcional: recargar la página para refrescar el estado
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error updating token:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el token: " + (error.message || 'Error desconocido'),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Token de WhatsApp Expirado</AlertTitle>
        <AlertDescription className="text-red-700 space-y-3">
          <p>
            El token de acceso de Meta WhatsApp ha expirado. Los mensajes no se pueden enviar hasta que se renueve el token.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Para renovar el token:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Vaya a Meta Developer Console</li>
              <li>Seleccione su aplicación de WhatsApp</li>
              <li>Vaya a WhatsApp {'->'} API Setup</li>
              <li>Genere un nuevo token temporal o configure un token permanente</li>
              <li>Copie el nuevo token y úselo en el botón de abajo</li>
            </ol>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleOpenMetaDeveloper}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Meta Developer Console
            </Button>
            <Button 
              onClick={() => setShowTokenDialog(true)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Actualizar Token Aquí
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Token de WhatsApp</DialogTitle>
            <DialogDescription>
              Pegue el nuevo token de acceso que obtuvo de Meta Developer Console.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Nuevo Token de Acceso</Label>
              <Input
                id="token"
                type="password"
                placeholder="Pegue aquí el nuevo token..."
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">Asegúrese de que el token:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Sea un token de producción (no temporal)</li>
                <li>Tenga los permisos necesarios para WhatsApp Business</li>
                <li>Esté asociado a la aplicación correcta</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTokenDialog(false);
                setNewToken('');
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateToken}
              disabled={isUpdating || !newToken.trim()}
            >
              {isUpdating ? 'Actualizando...' : 'Actualizar Token'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
