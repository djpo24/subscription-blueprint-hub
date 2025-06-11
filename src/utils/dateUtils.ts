
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatTripDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  try {
    // Handle different date formats
    let date: Date;
    
    if (dateString.includes('T')) {
      // ISO format with time
      date = parseISO(dateString);
    } else {
      // Date-only format (YYYY-MM-DD)
      date = parseISO(dateString + 'T00:00:00');
    }

    if (!isValid(date)) {
      console.warn('Invalid date format:', dateString);
      return 'Fecha inválida';
    }

    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  try {
    const date = parseISO(dateString);
    
    if (!isValid(date)) {
      console.warn('Invalid datetime format:', dateString);
      return 'Fecha inválida';
    }

    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting datetime:', dateString, error);
    return 'Error en fecha';
  }
}

export function formatDateDisplay(dateString: string, formatStr: string): string {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  try {
    // Handle different date formats
    let date: Date;
    
    if (dateString.includes('T')) {
      // ISO format with time
      date = parseISO(dateString);
    } else {
      // Date-only format (YYYY-MM-DD)
      date = parseISO(dateString + 'T00:00:00');
    }

    if (!isValid(date)) {
      console.warn('Invalid date format:', dateString);
      return 'Fecha inválida';
    }

    return format(date, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
}

export function formatDateForQuery(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
