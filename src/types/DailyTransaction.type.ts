export enum EDailyTransactionType {
  INCOME = 'INCOME',
  SPENDINGS = 'SPENDINGS',
  BALANCE = 'BALANCE',
}

export type TDailyTransaction = {
  date: Date | number;
  amount: number;
};
