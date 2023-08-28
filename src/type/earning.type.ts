import type { CategoryView } from './category.type';

export type Earning = {
  sum: number;
  category: CategoryView;
  created_by: string;
};

export type DailyEarning = {
  date: Date;
  amount: number;
};
