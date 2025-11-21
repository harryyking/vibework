// lib/helpers.ts
export const getDurationString = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    return `${Math.floor(minutes / 60)}h`;
  };
  
  export const getDayAbbr = (day: number): string => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day];
  
  export const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];
  
  export const formatHeaderDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });