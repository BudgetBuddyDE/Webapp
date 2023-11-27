import { addMonths } from 'date-fns';

export function determineNextExecutionDate(executeAt: number) {
  const now = new Date();
  const today = now.getDate();
  if (executeAt >= today) {
    return new Date(now.getFullYear(), now.getMonth(), executeAt);
  } else {
    const nextMonth = addMonths(now, 1);
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), executeAt);
  }
}
