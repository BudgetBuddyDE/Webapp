import { supabase } from '../supabase';
import type { IBaseBudget, IBudget, IExportBudget } from '../types/budget.interface';
import type { TExportType } from '../components/user-profile.component';

export class BudgetService {
  private static table = 'budget';

  static async create(budget: IBaseBudget[]): Promise<IBaseBudget[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IBaseBudget>(this.table).insert(budget);
      if (error) rej(error);
      res(data);
    });
  }

  static async getBudget(uuid: string): Promise<IBudget[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBudget>('BudgetProgress')
        .select('*')
        .eq('created_by', uuid);
      if (error) rej(error);
      res(data);
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

  static async deleteById(id: number): Promise<IBaseBudget[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseBudget>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data);
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
            .from<IBaseBudget>(this.table)
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
