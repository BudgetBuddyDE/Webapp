/**
 * // TODO: Get language and currency from browser-settings(current location?)
 */
export function formatBalance(balance: number, currency = 'EUR'): string {
  return balance.toLocaleString('de-DE', {style: 'currency', currency: currency});
}
