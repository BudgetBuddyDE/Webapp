/**
 * Converts the given balance value to a number.
 *
 * @param balance - The balance value as a string
 * @returns The number representing the balance value
 */
export function transformBalance(balance: string): number {
  return Number(balance.replace(',', '.'));
}
