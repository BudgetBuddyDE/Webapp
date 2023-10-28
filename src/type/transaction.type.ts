import type { Description, uuid } from '.';
import type { CategoryView } from './category.type';
import type { PaymentMethodView } from './payment-method.type';

/**
 * Object like it's stored in our database
 */
export type TBaseTransaction = {
  id: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: Description;
  amount: number;
  date: string | Date;
  created_by: uuid;
  updated_at: string;
  inserted_at: string;
};

/**
 * `TBaseTransaction` with resolved foreign-keys
 */
export type TTransaction = {
  id: number;
  categories: CategoryView;
  paymentMethods: PaymentMethodView;
  receiver: string;
  description: Description;
  amount: number;
  date: string;
  created_by: uuid;
  updated_at: string;
  inserted_at: string;
};

/**
 * Object that will be avaiable for export
 */
export type TExportTransaction = {
  id: number;
  category: number;
  categories: CategoryView;
  paymentMethod: number;
  paymentMethods: PaymentMethodView;
  receiver: string;
  description: Description;
  amount: number;
  date: string;
  created_by: uuid;
  updated_at: string;
  inserted_at: string;
};

/**
 * Required properties for the creation of an transaction
 */
export type TCreateTransactionProps = Omit<TBaseTransaction, 'id' | 'updated_at' | 'inserted_at'>;

/**
 * Required properties in order to update an transaction
 */
export type TUpdateTransactionProps = Omit<TBaseTransaction, 'created_by' | 'updated_at' | 'inserted_at'>;
