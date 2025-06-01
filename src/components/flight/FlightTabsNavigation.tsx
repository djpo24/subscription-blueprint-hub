
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FlightTabsNavigation() {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="compact">Estilo Compacto</TabsTrigger>
      <TabsTrigger value="new-format">Formato Nuevo</TabsTrigger>
      <TabsTrigger value="detailed">Vista Detallada</TabsTrigger>
    </TabsList>
  );
}
