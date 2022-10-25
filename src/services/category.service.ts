import { supabase } from '../supabase';
import type { IBaseCategory, ICategory, IExportCategory } from '../types/category.type';
import type { TExportType } from '../components/user-profile.component';

export class CategoryService {
  private static table = 'categories';

  static async createCategories(categories: Partial<IBaseCategory>[]): Promise<IBaseCategory[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IBaseCategory>(this.table).insert(categories);
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async getCategories(): Promise<ICategory[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<ICategory>(this.table)
        .select('*')
        .order('name', { ascending: true });
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async updateCategory(
    id: number,
    updatedCategory: Partial<IBaseCategory>
  ): Promise<ICategory[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseCategory>(this.table)
        .update(updatedCategory)
        .match({ id: id });
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async deleteCategoryById(id: number): Promise<IBaseCategory[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseCategory>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data ?? []);
    });
  }

  /**
   * Get all categories, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<IExportCategory[] | string> {
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
