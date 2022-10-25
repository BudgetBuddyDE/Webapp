import type { uuid } from './profile.type';
import type { ICategoryView } from './category.type';
import type { IPaymentMethodView } from './paymentMethod.type';

/**
 * Object like it's stored in our database
 */
export interface IBaseSubscription {
  id: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: string | null;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * Object that will be avaiable for export
 */
export interface IExportSubscription {
  id: number;
  category: number;
  categories: ICategoryView;
  paymentMethod: number;
  paymentMethods: IPaymentMethodView;
  receiver: string;
  description: string | null;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * `IBaseSubscription` with resolved foreign-keys
 */
export interface ISubscription {
  id: number;
  categories: ICategoryView;
  paymentMethods: IPaymentMethodView;
  receiver: string;
  description: string | null;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}
