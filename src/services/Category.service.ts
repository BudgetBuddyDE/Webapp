import { Category } from '@/models/Category.model';
import { SupabaseClient } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import type { CategoryTable, CategoryView, ExportCategory } from '@/type/category.type';

export class CategoryService {
    private static table = 'categories';

    static async createCategories(categories: Partial<CategoryTable>[]): Promise<Category[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).insert(categories).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<CategoryTable[]>;
            res(data ? data.map((category) => new Category(category)) : []);
        });
    }

    static async getCategories(): Promise<Category[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).select('*').order('name', { ascending: true });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<CategoryTable[]>;
            res(data ? data.map((category) => new Category(category)) : []);
        });
    }

    static async delete(categories: Category['id'][]): Promise<Category[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().in('id', categories).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<CategoryTable[]>;
            res(data ? data.map((category) => new Category(category)) : []);
        });
    }

    /**
     * @deprecated Use `Category.delete()` instead of the the `CategoryService.updateCategory(...)`
     */
    static async updateCategory(
        id: number,
        updatedCategory: Pick<CategoryTable, 'name' | 'description' | 'created_by'>
    ): Promise<Category[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).update(updatedCategory).match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<CategoryTable[]>;
            res(data ? data.map((category) => new Category(category)) : []);
        });
    }

    /**
     * @deprecated Use `Category.delete()` instead of the the `CategoryService.deleteCategoryById(...)`
     */
    static async deleteCategoryById(id: number): Promise<Category[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<CategoryTable[]>;
            res(data ? data.map((category) => new Category(category)) : []);
        });
    }

    /**
     * Get all categories, ready for the export
     */
    static export(type: ExportFormat = 'JSON'): Promise<ExportCategory[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    SupabaseClient()
                        .from(this.table)
                        .select(`*`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    SupabaseClient()
                        .from(this.table)
                        .select(`*`)
                        .csv()
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? '');
                        });
                    break;
            }
        });
    }

    static getStats(type: 'COUNT' | 'EARNINGS' | 'SPENDINGS'): Promise<{ value: number; category: CategoryView }[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().rpc('get_category_stats', { type: type });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<
                {
                    value: number;
                    category: CategoryView;
                }[]
            >;
            res(data ?? []);
        });
    }
}
