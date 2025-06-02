
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export function TokenExpirationAlert() {
  const handleOpenMetaDeveloper = () => {
    window.open('https://developers.facebook.com/apps', '_blank');
  };

  return (
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
            <li>Actualice el token en la configuración de Supabase</li>
          </ol>
        </div>
        <Button 
          onClick={handleOpenMetaDeveloper}
          className="bg-red-600 hover:bg-red-700"
          size="sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir Meta Developer Console
        </Button>
      </AlertDescription>
    </Alert>
  );
}
