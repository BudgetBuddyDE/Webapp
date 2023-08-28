import type { Description, uuid } from '.';
import type { CategoryView } from './category.type';
import type { PaymentMethodView } from './payment-method.type';

/**
 * Object like it's stored in our database
 */
export type TBaseSubscription = {
  id: number;
  /** Default `false` */
  paused: boolean;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: Description;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
};

/**
 * Object that will be avaiable for export
 */
export type TExportSubscription = {
  id: number;
  /** Default `false` */
  paused: boolean;
  category: number;
  categories: CategoryView;
  paymentMethod: number;
  paymentMethods: PaymentMethodView;
  receiver: string;
  description: Description;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
};

/**
 * `IBaseSubscription` with resolved foreign-keys
 */
export type TSubscription = {
  id: number;
  /** Default `false` */
  paused: boolean;
  categories: CategoryView;
  paymentMethods: PaymentMethodView;
  receiver: string;
  description: Description;
  amount: number;
  execute_at: number;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
};
