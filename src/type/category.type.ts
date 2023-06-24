import type { Description, uuid } from '.';

/**
 * Object like it's stored in our database
 */
export type CategoryTable = {
    /** PK */
    id: number;
    name: string;
    description: Description;
    created_by: uuid;
    updated_at: string;
    inserted_at: string;
};

/**
 * Object with resolved foreign-keys
 */
export type Category = CategoryTable;

/**
 * Object that will be avaiable for export
 */
export type ExportCategory = CategoryTable;

/**
 * Object used in views
 */
export type CategoryView = {
    id: number;
    name: string;
    description: Description;
};

export type CategoryOverview = {
    [categoryId: CategoryTable['id']]: { amount: number; name: Category['name'] };
};
