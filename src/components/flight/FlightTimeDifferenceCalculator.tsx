
export interface TimeDifference {
  minutes: number;
  isDelay: boolean;
  isEarly: boolean;
}

export const calculateTimeDifference = (scheduled: string | null, actual: string | null): TimeDifference | null => {
  if (!scheduled || !actual) return null;
  
  const scheduledTime = new Date(scheduled);
  const actualTime = new Date(actual);
  const diffMinutes = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
  
  if (Math.abs(diffMinutes) < 5) return null; // Diferencia insignificante
  
  return {
    minutes: Math.abs(diffMinutes),
    isDelay: diffMinutes > 0,
    isEarly: diffMinutes < 0
  };
};
