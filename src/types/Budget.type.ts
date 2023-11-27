import type { TCategory, TCreatedAt, TUser } from '.';

export type TBudget = {
  id: number;
  category: TCategory;
  owner: TUser;
  budget: number;
  createdAt: TCreatedAt;
};

export type TCreateBudgetPayload = {
  owner: TBudget['owner']['uuid'];
  categoryId: TBudget['category']['id'];
} & Pick<TBudget, 'budget'>;

export type TUpdateBudgetPayload = {
  budgetId: TBudget['id'];
  categoryId: TBudget['category']['id'];
} & Pick<TBudget, 'budget'>;

export type TDeleteBudgetPayload = { budgetId: TBudget['id'] };

export type TBudgetProgress = TBudget & {
  amount_spent: number;
};
