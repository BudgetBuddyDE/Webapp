/**
 * FIXME: Make sure we won't have any duplicates and the id will be unique amongst his list
 */
export function generateRandomId() {
  return Math.round(Math.random() * new Date().getTime());
}
