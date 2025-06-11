
import { Badge } from '@/components/ui/badge';

interface PackageStatusBadgeProps {
  status: string;
}

export function PackageStatusBadge({ status }: PackageStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "recibido":
        return "bg-blue-100 text-blue-800";
      case "bodega":
        return "bg-gray-100 text-gray-800";
      case "procesado":
        return "bg-orange-100 text-orange-800";
      case "despachado":
        return "bg-purple-100 text-purple-800";
      case "transito":
        return "bg-purple-100 text-purple-800";
      case "en_destino":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      // Estados legacy para compatibilidad
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      case "arrived":
        return "bg-yellow-100 text-yellow-800";
      case "warehouse":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "recibido":
        return "Recibido";
      case "bodega":
        return "Bodega";
      case "procesado":
        return "Procesado";
      case "despachado":
        return "Despachado";
      case "transito":
        return "Tránsito";
      case "en_destino":
        return "En Destino";
      case "delivered":
        return "Entregado";
      // Estados legacy para compatibilidad
      case "in_transit":
        return "En Tránsito";
      case "pending":
        return "Pendiente";
      case "delayed":
        return "Retrasado";
      case "arrived":
        return "Llegado";
      case "warehouse":
        return "En Bodega";
      default:
        return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
}
