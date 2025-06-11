
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

// Nueva función específica para fechas de despacho que evita conversiones de zona horaria
export function formatDispatchDate(dateString: string): string {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  try {
    // Para fechas de despacho, asumimos que son fechas locales sin conversión de zona horaria
    // Parseamos manualmente para evitar interpretación como UTC
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Los meses en JavaScript son 0-indexados
      const day = parseInt(parts[2]);
      
      const date = new Date(year, month, day);
      return format(date, 'dd/MM/yyyy');
    }
    
    // Fallback al método anterior si el formato no es el esperado
    return formatDateDisplay(dateString, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting dispatch date:', dateString, error);
    return 'Error en fecha';
  }
}
