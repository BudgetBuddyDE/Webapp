import type { uuid } from './profile.type';
import type { ICategoryView } from './category.type';
import type { IPaymentMethodView } from './paymentMethod.type';

/**
 * Object like it's stored in our database
 */
export interface IBaseTransaction {
  id: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: string | null;
  amount: number;
  date: string | Date;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * `IBaseTransaction` with resolved foreign-keys
 */
export interface ITransaction {
  id: number;
  categories: ICategoryView;
  paymentMethods: IPaymentMethodView;
  receiver: string;
  description: string | null;
  amount: number;
  date: string | Date;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * Object that will be avaiable for export
 */
export interface IExportTransaction {
  id: number;
  category: number;
  categories: ICategoryView;
  paymentMethod: number;
  paymentMethods: IPaymentMethodView;
  receiver: string;
  description: string | null;
  amount: number;
  date: string | Date;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

export interface IExpenseTransactionDTO {
  sum: number;
  category: {
    id: number;
    name: string;
    description: string | null;
  };
  created_by: uuid;
}
