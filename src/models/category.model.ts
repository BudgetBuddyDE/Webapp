import { CategoryService } from '@/services/Category.service';
import type { Description, uuid } from '@/type';
import type { CategoryTable, CategoryView } from '@/type/category.type';

export class Category {
    id: number;
    name: string;
    description: Description;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({ id, name, description, created_by, updated_at, inserted_at }: CategoryTable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    get categoryView() {
        const view: CategoryView = {
            id: this.id,
            name: this.name,
            description: this.description,
        };
        return view;
    }

    async update(updatedInformation: Pick<CategoryTable, 'name' | 'description'>) {
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
