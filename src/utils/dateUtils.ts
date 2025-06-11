
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

/**
 * Formatea fechas sin conversión de zona horaria (especialmente útil para fechas de despacho)
 * Esta función evita que las fechas se muestren incorrectamente debido a las conversiones
 * automáticas de zona horaria que hace JavaScript
 */
export function formatDispatchDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  try {
    // Para fechas tipo YYYY-MM-DD, parseamos manualmente para evitar conversiones de zona horaria
    const parts = String(dateString).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Los meses en JavaScript son 0-indexados
      const day = parseInt(parts[2]);
      
      // Crear fecha local sin conversión de zona horaria
      const date = new Date(year, month, day);
      return format(date, 'dd/MM/yyyy');
    }
    
    // Para otros formatos de fecha, usar método que previene conversiones
    // pero que maneje correctamente los casos con información de tiempo
    if (dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      return formatDispatchDate(dateOnly);
    }
    
    // Último recurso: usar el formateador genérico
    console.warn('Formato de fecha no estándar, usando método alternativo:', dateString);
    return formatDateDisplay(dateString, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting dispatch date:', dateString, error);
    return 'Error en fecha';
  }
}

/**
 * Versión genérica de formatDispatchDate que acepta una fecha del tipo Date
 */
export function formatLocalDate(date: Date | null | undefined): string {
  if (!date) {
    return 'Fecha no disponible';
  }
  
  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting local date:', error);
    return 'Error en fecha';
  }
}
