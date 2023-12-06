export function getFirstDayOfMonth(date: Date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getLastDayOfMonth(date: Date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
