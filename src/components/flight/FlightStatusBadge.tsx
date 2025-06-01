
import { Badge } from '@/components/ui/badge';

interface FlightStatusBadgeProps {
  status: string;
  hasLanded: boolean;
}

export function FlightStatusBadge({ status, hasLanded }: FlightStatusBadgeProps) {
  const getStatusConfig = (status: string, hasLanded: boolean) => {
    if (hasLanded || status === 'arrived') {
      return {
        label: 'LLEGÓ',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      };
    }
    
    switch (status) {
      case 'in_flight':
        return {
          label: 'EN VUELO',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300'
        };
      case 'delayed':
        return {
          label: 'RETRASADO',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        };
      case 'scheduled':
        return {
          label: 'PROGRAMADO',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      case 'cancelled':
        return {
          label: 'CANCELADO',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        };
      default:
        return {
          label: 'PROGRAMADO',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
    }
  };

  const statusConfig = getStatusConfig(status, hasLanded);

  return (
    <Badge 
      className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border font-medium px-3 py-1`}
    >
      {statusConfig.label}
    </Badge>
  );
}
