import { supabase } from '../supabase';
import type { ICategory } from '../types/transaction.interface';
import type { TExportType } from '../components/user-profile.component';

export class CategoryService {
  private static table = 'categories';

  static async createCategories(categories: Partial<ICategory>[]): Promise<ICategory[] | null> {
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

  /**
   * Get all categories, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<ICategory[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from<ICategory>(this.table)
            .select(`*`)
            .then((result) => {
              if (result.error) rej(result.error);
              res(result.data ?? []);
            });
          break;

        case 'csv':
          supabase
            .from<ICategory>(this.table)
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
}
