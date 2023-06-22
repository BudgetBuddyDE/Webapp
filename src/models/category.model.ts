import { CategoryService } from '../services';
import type { IBaseCategory, ICategoryView, uuid } from '../types';

export class Category {
    id: number;
    name: string;
    description: string | null;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({ id, name, description, created_by, updated_at, inserted_at }: IBaseCategory) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    get categoryView() {
        const view: ICategoryView = {
            id: this.id,
            name: this.name,
            description: this.description,
        };
        return view;
    }

    async update(updatedInformation: { name: string; description: string | null }) {
        try {
            return await CategoryService.updateCategory(this.id, {
                ...updatedInformation,
                created_by: this.created_by,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async delete() {
        try {
            return await CategoryService.deleteCategoryById(this.id);
        } catch (error) {
            console.error(error);
        }
    }
}
