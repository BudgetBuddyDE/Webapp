import { BaseBudget } from '@/models/BaseBudget.model';
import { Budget } from '@/models/Budget.model';
import { supabase } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import type {
    BudgetProgressView,
    ExportBudget,
    MonthlyBalance,
    MonthlyBalanceAverage,
    BaseBudget as TBaseBudget,
} from '@/type/budget.type';

export class BudgetService {
    private static table = 'budget';

    static async create(budget: Partial<TBaseBudget>[]): Promise<[BaseBudget[], Error | null]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).insert(budget).select();
            if (response.error) rej([[], new Error(response.error.message)]);
            const data = response.data as SupabaseData<TBaseBudget[]>;
            res([data ? data.map((budget) => new BaseBudget(budget)) : [], null]);
        });
    }

    static async getBudget(uuid: string): Promise<Budget[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from('BudgetProgress').select('*').eq('created_by', uuid);
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<BudgetProgressView[]>;
            res(data ? data.map((budget) => new Budget(budget)) : []);
        });
    }

    static getMonthlyBalance(monthBacklog: number): Promise<MonthlyBalance[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('get_monthly_balance', {
                months: monthBacklog,
            });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<MonthlyBalance[]>;
            res(data ?? []);
        });
    }

    static getMonthlyBalanceAvg(monthBacklog: number): Promise<MonthlyBalanceAverage> {
        return new Promise(async (res) => {
            const months = await this.getMonthlyBalance(monthBacklog);
            const avgBalance = months.reduce((prev, cur) => prev + cur.sum, 0) / months.length;
            res({ months: months, avg: avgBalance });
        });
    }

    /**
     * @deprecated Use `Budget.delete()` instead of the the `BudgetService.update(...)`
     */
    static async update(id: number, updatedBudget: Partial<TBaseBudget>): Promise<BaseBudget[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).update(updatedBudget).match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseBudget[]>;
            res(data ? data.map((budget) => new BaseBudget(budget)) : []);
        });
    }

    /**
     * @deprecated Use `Budget.delete()` instead of the the `BudgetService.deleteById(...)`
     */
    static async deleteById(id: number): Promise<BaseBudget[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).delete().match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseBudget[]>;
            res(data ? data.map((budget) => new BaseBudget(budget)) : []);
        });
    }

    /**
     * Get all set category-budgets, ready for the export
     */
    static export(type: ExportFormat = 'JSON'): Promise<ExportBudget[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    supabase
                        .from(this.table)
                        .select(`*, categories:category(*)`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            // @ts-ignore
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    supabase
                        .from(`budget`)
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
