
import { format } from 'date-fns';

// Helper function to format date consistently avoiding timezone issues
export const formatDateForQuery = (date: Date): string => {
  // Use local date components to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date safely avoiding timezone issues - consistent with TripSelector
export const formatTripDate = (dateString: string) => {
  try {
    // Parse the date string directly (assumes YYYY-MM-DD format from database)
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('❌ [dateUtils] Error formatting date:', error);
    return dateString;
  }
};

// Format date for display in different formats
export const formatDateDisplay = (dateString: string, formatPattern: string = 'dd/MM/yyyy') => {
  try {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);
    return format(date, formatPattern);
  } catch (error) {
    console.error('❌ [dateUtils] Error formatting date:', error);
    return dateString;
  }
};
