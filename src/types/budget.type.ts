import type { ICategoryView } from './category.type';
import type { uuid } from './profile.type';

/**
 * Object like it's stored in our database
 */
export interface IBaseBudget {
  id: number;
  category: number;
  budget: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * Object that will be avaiable for export
 */
export interface IExportBudget {
  id: number;
  category: ICategoryView;
  budget: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * Structure of out `BudgetProgress`-view
 */
export interface IBudgetProgressView {
  id: number;
  category: ICategoryView;
  budget: number;
  currentlySpent: number | null;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * Structure of `MonthlyBalance`
 */
export interface IMonthlyBalance {
  year: number;
  month: number;
  sum: number;
}
export interface IMonthlyBalanceAvg {
  months: IMonthlyBalance[];
  avg: number;
}
