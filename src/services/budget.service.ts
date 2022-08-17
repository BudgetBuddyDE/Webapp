import { supabase } from '../supabase';
import type { IBaseBudget, IBudget } from '../types/budget.interface';

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
}
