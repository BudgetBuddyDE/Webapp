import type { uuid } from '@/types';

/**
 * Object like it's stored in our database
 */
export interface IBaseCategory {
    id: number;
    name: string;
    description: string | null;
    created_by: uuid;
    updated_at: string;
    inserted_at: string;
}
export interface IEditCategory {
    name: string;
    description: string | null;
    created_by: uuid;
}

/**
 * Object with resolved foreign-keys
 */
export interface ICategory extends IBaseCategory {}

/**
 * Object that will be avaiable for export
 */
export interface IExportCategory extends IBaseCategory {}

/**
 * Object used in views
 */
export interface ICategoryView {
    id: number;
    name: string;
    description: string | null;
}
