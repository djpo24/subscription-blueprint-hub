
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DispatchDateInfoProps {
  currentDate: Date;
}

export function DispatchDateInfo({ currentDate }: DispatchDateInfoProps) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="text-sm text-blue-800">
        <strong>Fecha del despacho:</strong> {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })} (Fecha actual)
      </div>
      <div className="text-xs text-blue-600 mt-1">
        El despacho se registrará automáticamente con la fecha actual del sistema
      </div>
    </div>
  );
}
