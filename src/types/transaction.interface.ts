import type { ICategory } from './category.type';
import type { IPaymentMethod } from './paymentMethod.type';

export type IExpense = {
  sum: number;
  category: { id: number; name: string; description: string | null };
  created_by: string;
};

export type IIncome = {
  sum: number;
  category: { id: number; name: string; description: string | null };
  created_by: string;
};

export interface IBaseSubscription {
  id?: number;
  categories: ICategory;
  paymentMethods: IPaymentMethod;
  receiver: string;
  amount: number;
  description: string | null;
  execute_at: number;
}
export interface IBaseSubscriptionDTO {
  id?: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  amount: number;
  description: string | null;
  execute_at: number;
}

export interface ISubscription extends IBaseSubscription {
  id: number;
  created_by: string;
  updated_at: Date;
  inserted_at: Date;
}
