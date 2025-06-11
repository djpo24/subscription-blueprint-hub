
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDateDisplay = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return 'Fecha inválida';
  }
};
