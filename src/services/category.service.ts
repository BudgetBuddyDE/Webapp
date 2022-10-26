import { supabase } from '../supabase';
import { Category } from '../models/category.model';
import type {
  IEditCategory,
  IBaseCategory,
  ICategory,
  IExportCategory,
} from '../types/category.type';
import type { TExportType } from '../components/user-profile.component';

export class CategoryService {
  private static table = 'categories';

  static async createCategories(categories: Partial<IBaseCategory>[]): Promise<Category[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IBaseCategory>(this.table).insert(categories);
      if (error) rej(error);
      res(data ? data.map((category) => new Category(category)) : []);
    });
  }

  static async getCategories(): Promise<Category[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseCategory>(this.table)
        .select('*')
        .order('name', { ascending: true });
      if (error) rej(error);
      res(data?.map((category) => new Category(category)) ?? []);
    });
  }

  static async updateCategory(id: number, updatedCategory: IEditCategory): Promise<Category[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseCategory>(this.table)
        .update(updatedCategory)
        .match({ id: id });
      if (error) rej(error);
      res(data ? data.map((category) => new Category(category)) : []);
    });
  }

  static async deleteCategoryById(id: number): Promise<Category[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseCategory>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data ? data.map((category) => new Category(category)) : []);
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
