/**
 * // TODO: Get language and currency from browser-settings(current location?)
 */
export function formatBalance(balance: number): string {
  return balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
