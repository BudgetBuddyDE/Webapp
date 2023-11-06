import type { TCategory, TCreatedAt, TDescription } from '.';

export type TBudget = {
  id: number;
  category: TCategory;
  name: string;
  description: TDescription;
  createdAt: TCreatedAt;
};
