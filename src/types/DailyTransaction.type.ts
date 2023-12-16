import { z } from 'zod';

export enum EDailyTransactionType {
  INCOME = 'INCOME',
  SPENDINGS = 'SPENDINGS',
  BALANCE = 'BALANCE',
}

export const ZDailyTransaction = z.object({
  date: z.date(),
  amount: z.number(),
});
export type TDailyTransaction = z.infer<typeof ZDailyTransaction>;
