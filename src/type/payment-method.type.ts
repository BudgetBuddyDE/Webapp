import type { Description, uuid } from '.';

/**
 * Object like it's stored in our database
 */
export type PaymentMethodTable = {
    /** PK */
    id: number;
    name: string;
    provider: string;
    address: string;
    description: Description;
    created_by: uuid;
    updated_at: string | Date;
    inserted_at: string | Date;
};

/**
 * `IBasePaymentMethod` with resolved foreign-keys
 */
export type PaymentMethod = PaymentMethodTable;

/**
 * Object that will be avaiable for export
 */
export type ExportPaymentMethod = PaymentMethod;

/**
 * Object used in views
 */
export type PaymentMethodView = {
    id: number;
    name: string;
    address: string;
    provider: string;
    description: Description;
};
