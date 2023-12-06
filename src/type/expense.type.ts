import type { CategoryView } from './category.type';

export type Expense = {
  sum: number;
  category: CategoryView;
  created_by: string;
};

export type DailyExpense = {
  date: Date;
  amount: number;
};
