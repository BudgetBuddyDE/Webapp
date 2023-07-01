import type { Description, uuid } from '.';
import type { CategoryView } from './category.type';
import type { PaymentMethodView } from './payment-method.type';

/**
 * Object like it's stored in our database
 */
export type TransactionTable = {
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
 * `TransactionTable` with resolved foreign-keys
 */
export type Transaction = {
    id: number;
    categories: CategoryView;
    paymentMethods: PaymentMethodView;
    receiver: string;
    description: string | null;
    amount: number;
    date: string;
    created_by: uuid;
    updated_at: string;
    inserted_at: string;
};

/**
 * Object that will be avaiable for export
 */
export type ExportTransaction = {
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
