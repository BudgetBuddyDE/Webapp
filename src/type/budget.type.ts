import type { uuid } from '.';
import type { CategoryView } from './category.type';
import type { DailyEarning, Earning } from './earning.type';
import type { DailyExpense, Expense } from './expense.type';

/**
 * Object like it's stored in our database
 */
export type BaseBudget = {
    id: number;
    category: number;
    budget: number;
    created_by: uuid;
    updated_at: string | Date;
    inserted_at: string | Date;
};

/**
 * Object that will be avaiable for export
 */
export type ExportBudget = {
    id: number;
    category: CategoryView;
    budget: number;
    created_by: uuid;
    updated_at: string | Date;
    inserted_at: string | Date;
};

/**
 * Structure of out `BudgetProgress`-view
 */
export type BudgetProgressView = {
    id: number;
    category: CategoryView;
    budget: number;
    currentlySpent: number | null;
    created_by: uuid;
    updated_at: string | Date;
    inserted_at: string | Date;
};

/**
 * Structure of `MonthlyBalance`
 */
export type MonthlyBalance = {
    year: number;
    month: number;
    sum: number;
};

export type MonthlyBalanceAverage = {
    months: MonthlyBalance[];
    avg: number;
};

export type BudgetTransactions = {
    selected: DailyEarning | DailyExpense | null;
    income: {
        daily: DailyEarning[];
        grouped: Earning[];
    };
    spendings: {
        daily: DailyExpense[];
        grouped: Expense[];
    };
};
