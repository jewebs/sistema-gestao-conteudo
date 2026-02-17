
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};


export const formatDate = (dateString: string | null | undefined, options: Intl.DateTimeFormatOptions = {}): string => {
  if (!dateString) return 'N/A';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };
  return new Date(dateString).toLocaleDateString('pt-BR', defaultOptions);
};

export const formatDateTime = (dateString: string): string => {
   if (!dateString) return 'N/A';
   return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const getWeekRange = (date: Date): { start: Date, end: Date } => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = addDays(new Date(monday), 6); // Sunday is 6 days after Monday
  return { start: startOfDay(monday), end: endOfDay(sunday) };
};
