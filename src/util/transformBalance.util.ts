export function transformBalance(balance: string) {
    return Number(balance.replace(',', '.'));
}
