
// Helper function to format date consistently avoiding timezone issues
export const formatDateForQuery = (date: Date): string => {
  // Use local date components to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
