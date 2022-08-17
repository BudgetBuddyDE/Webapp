import { ICategory } from './transaction.interface';

export interface IBaseBudget {
  id?: number;
  category: number;
  budget: number;
  created_by?: string;
  created_at?: string;
  inserted_at?: string;
}

export interface IBudget {
  id: number;
  category: ICategory;
  budget: number;
  currentlySpent: number;
  created_by?: string;
  created_at?: string;
  inserted_at?: string;
}
