
import { Button } from '@/components/ui/button';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';
import { Plane, RefreshCw } from 'lucide-react';

export function ManualFlightMonitorButton() {
  const { startMonitoring, isMonitoring } = useFlightMonitor();

  const handleManualMonitoring = () => {
    console.log('🎯 INICIANDO MONITOREO MANUAL COMPLETO - Consulta API para AV92');
    startMonitoring();
  };

  return (
    <Button 
      onClick={handleManualMonitoring}
      disabled={isMonitoring}
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
    >
      {isMonitoring ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Plane className="h-4 w-4" />
      )}
      {isMonitoring ? 'Consultando API...' : 'Consultar API AV92'}
    </Button>
  );
}
