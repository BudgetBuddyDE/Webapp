import type { TCategory, TCreatedAt, TDescription } from '.';

export type TBudget = {
  id: number;
  category: TCategory;
  name: string;
  description: TDescription;
  budget: number;
  createdAt: TCreatedAt;
};

export type TBudgetProgress = TBudget & {
  amount_spent: number;
};
