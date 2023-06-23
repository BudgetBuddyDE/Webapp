import type { TExportType } from '@/components/user-profile.component';
import { BaseBudget, Budget } from '@/models/budget.model';
import { supabase } from '@/supabase';
import type {
    IBaseBudget,
    IBudgetProgressView,
    IExportBudget,
    IMonthlyBalance,
    IMonthlyBalanceAvg,
} from '@/types/budget.type';

export class BudgetService {
    private static table = 'budget';

    static async create(budget: Partial<IBaseBudget>[]): Promise<BaseBudget[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.from<IBaseBudget>(this.table).insert(budget);
            if (error) rej(error);
            res(data ? data.map((budget) => new BaseBudget(budget)) : []);
        });
    }

    static async getBudget(uuid: string): Promise<Budget[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase
                .from<IBudgetProgressView>('BudgetProgress')
                .select('*')
                .eq('created_by', uuid);
            if (error) rej(error);
            res(data ? data.map((budget) => new Budget(budget)) : []);
        });
    }

    static getMonthlyBalance(monthBacklog: number): Promise<IMonthlyBalance[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.rpc('get_monthly_balance', {
                months: monthBacklog,
            });
            if (error) rej(error);
            res(data ?? []);
        });
    }

    static getMonthlyBalanceAvg(monthBacklog: number): Promise<IMonthlyBalanceAvg> {
        return new Promise(async (res) => {
            const months = await this.getMonthlyBalance(monthBacklog);
            const avgBalance = months.reduce((prev, cur) => prev + cur.sum, 0) / months.length;
            res({ months: months, avg: avgBalance });
        });
    }

    /**
     * @deprecated Use `Budget.delete()` instead of the the `BudgetService.update(...)`
     */
    static async update(id: number, updatedBudget: Partial<IBaseBudget>): Promise<BaseBudget[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase
                .from<IBaseBudget>(this.table)
                .update(updatedBudget)
                .match({ id: id });
            if (error) rej(error);
            res(data ? data.map((budget) => new BaseBudget(budget)) : []);
        });
    }

    /**
     * @deprecated Use `Budget.delete()` instead of the the `BudgetService.deleteById(...)`
     */
    static async deleteById(id: number): Promise<IBaseBudget[]> {
        return new Promise(async (res, rej) => {
            const { data, error } = await supabase.from<IBaseBudget>(this.table).delete().match({ id: id });
            if (error) rej(error);
            res(data ? data.map((budget) => new BaseBudget(budget)) : []);
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
