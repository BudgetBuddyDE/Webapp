import { supabase } from '../supabase';
import type { ICategory } from '../types/transaction.interface';

export class CategoryService {
  private static table = 'categories';

  static async createCategories(categories: ICategory[]): Promise<ICategory[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<ICategory>(this.table).insert(categories);
      if (error) rej(error);
      res(data);
    });
  }

  static async getCategories(): Promise<ICategory[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<ICategory>(this.table)
        .select('*')
        .order('name', { ascending: true });
      if (error) rej(error);
      res(data);
    });
  }

  static async updateCategory(
    id: number,
    updatedCategory: Partial<ICategory>
  ): Promise<ICategory[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<ICategory>(this.table)
        .update(updatedCategory)
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  static async deleteCategoryById(id: number): Promise<ICategory[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<ICategory>(this.table).delete().match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }
}
