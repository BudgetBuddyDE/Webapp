import { supabase } from '../supabase';
import type { IBaseBudget, IBudgetProgressView, IExportBudget } from '../types/budget.type';
import type { TExportType } from '../components/user-profile.component';

export class BudgetService {
  private static table = 'budget';

  static async create(budget: Partial<IBaseBudget>[]): Promise<IBaseBudget[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IBaseBudget>(this.table).insert(budget);
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async getBudget(uuid: string): Promise<IBudgetProgressView[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBudgetProgressView>('BudgetProgress')
        .select('*')
        .eq('created_by', uuid);
      if (error) rej(error);
      res(data ?? []);
    });
  }

  static async update(
    id: number,
    updatedBudget: Partial<IBaseBudget>
  ): Promise<IBaseBudget[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseBudget>(this.table)
        .update(updatedBudget)
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  static async deleteById(id: number): Promise<IBaseBudget[]> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseBudget>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data ?? []);
    });
  }

  /**
   * Get all set category-budgets, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<IExportBudget[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from<IExportBudget>(this.table)
            .select(`*, categories:category(*)`)
            .then((result) => {
              if (result.error) rej(result.error);
              // @ts-ignore
              res(result.data ?? []);
            });
          break;

        case 'csv':
          supabase
            .from<IBaseBudget>(`budget`)
            .select(`*, categories:category(*)`)
            .csv()
            .then((result) => {
              if (result.error) rej(result.error);
              res((result.data as string) ?? '');
            });
          break;
      }
    });
  }
}
