import type { uuid } from './profile.type';

/**
 * Object like it's stored in our database
 */
export interface IBasePaymentMethod {
  id: number;
  name: string;
  provider: string;
  address: string;
  description: string | null;
  created_by: uuid;
  updated_at: string | Date;
  inserted_at: string | Date;
}

/**
 * `IBasePaymentMethod` with resolved foreign-keys
 */
export interface IPaymentMethod extends IBasePaymentMethod {}

/**
 * Object that will be avaiable for export
 */
export interface IExportPaymentMethod extends IPaymentMethod {}

/**
 * Object used in views
 */
export interface IPaymentMethodView {
  id: number;
  name: string;
  address: string;
  provider: string;
  description: string | null;
}
