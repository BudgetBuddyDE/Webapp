import { isSameMonth } from 'date-fns';
import { BaseTransaction } from '@/models/BaseTransaction.model';
import { Transaction } from '@/models/Transaction.model';
import { supabase } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import type { DailyEarning, Earning } from '@/type/earning.type';
import type { DailyExpense, Expense } from '@/type/expense.type';
import type {
    TBaseTransaction,
    TCreateTransactionProps,
    TExportTransaction,
    TTransaction,
    TUpdateTransactionProps,
} from '@/type/transaction.type';

export class TransactionService {
    private static table = 'transactions';

    static getTableName() {
        return this.table;
    }

    static getSelectQuery(): string {
        return 'id, amount, receiver, description, date, created_by, updated_at, inserted_at, paymentMethods (id, name, address, provider, description), categories (id, name, description)';
    }

    static async createTransactions(transactions: TCreateTransactionProps[]): Promise<[Transaction[], Error | null]> {
        return new Promise(async (res, rej) => {
            const response = await supabase
                .from(this.table)
                .insert(
                    transactions.map((t) => ({
                        ...t,
                        date: typeof t.date == 'string' ? new Date(t.date) : t.date,
                        description: t.description == null || t.description.length == 0 ? null : t.description,
                    }))
                )
                .select(this.getSelectQuery());
            if (response.error) rej([[], new Error(response.error.message)]);
            if (!response.data || response.data.length == 0) return [[], new Error("Couldn't save")];
            // @ts-expect-error
            const data = response.data as SupabaseData<TTransaction[]>;
            res([data ? data.map((transaction) => new Transaction(transaction)) : [], null]);
        });
    }

    static async getTransactions(amount = 1000): Promise<Transaction[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase
                .from(this.table)
                .select(this.getSelectQuery())
                .order('date', { ascending: false })
                .limit(amount);
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransaction[]>;
            res(data ? data.map((category) => new Transaction(category)) : []);
        });
    }

    /**
     * // TODO: Rename to updateField/updateColumn/updateAttribute
     * @param transactions
     * @param column
     * @param value
     */
    static async update(
        transactions: TBaseTransaction['id'][],
        column: keyof Pick<TBaseTransaction, 'category' | 'paymentMethod'>,
        value: TBaseTransaction['category'] | TBaseTransaction['paymentMethod']
    ): Promise<Transaction[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase
                .from(this.table)
                .update({ [column]: value })
                .in('id', transactions)
                .select(this.getSelectQuery());
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransaction[]>;
            res(data ? data.map((transaction) => new Transaction(transaction)) : []);
        });
    }

    static async delete(transactions: BaseTransaction['id'][]): Promise<BaseTransaction[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).delete().in('id', transactions).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TBaseTransaction[]>;
            res(data ? data.map((category) => new BaseTransaction(category)) : []);
        });
    }

    static async getAllTimeExpenses(userId: string): Promise<Expense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from('AllTimeExpenses').select('*').eq('created_by', userId);
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    static async getCurrentMonthExpenses(userId: string): Promise<Expense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from('CurrentMonthExpenses').select('*').eq('created_by', userId);
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    static async getDailyExpenses(startDate: Date, endDate: Date): Promise<DailyExpense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('get_daily_transactions', {
                requested_data: 'SPENDINGS',
                end_date: endDate,
                start_date: startDate,
            });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<DailyExpense[]>;
            res(data ? data.map((day) => ({ ...day, amount: Math.abs(day.amount) })) : null);
        });
    }

    static async getExpenses(userId: string, startDate: Date, endDate: Date): Promise<Expense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('getExpenses', {
                endDate: endDate,
                startDate: startDate,
                userId: userId,
            });
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    static async getDailyEarnigns(startDate: Date, endDate: Date): Promise<DailyEarning[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('get_daily_transactions', {
                requested_data: 'INCOME',
                end_date: endDate,
                start_date: startDate,
            });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<DailyExpense[]>;
            res(data ? data.map((day) => ({ ...day, amount: Math.abs(day.amount) })) : null);
        });
    }

    static async getEarnings(userId: string, startDate: Date, endDate: Date): Promise<Earning[] | null> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('getIncome', {
                endDate: endDate,
                startDate: startDate,
                userId: userId,
            });
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    /**
     * @deprecated Use `Transaction.update()` instead of the the `TransactionService.updateTransaction(...)`
     */
    static async updateTransaction(id: number, updatedTransaction: TUpdateTransactionProps): Promise<Transaction[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase
                .from(this.table)
                .update(updatedTransaction)
                .match({ id: id })
                .select(this.getSelectQuery());
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransaction[]>;
            res(data ? data.map((transaction) => new Transaction(transaction)) : []);
        });
    }

    static calculateReceivedEarnings(transactions: Transaction[]): number {
        const now = new Date();
        return transactions
            .filter(({ amount, date }) => amount > 0 && date <= now && isSameMonth(date, now))
            .reduce((prev, cur) => prev + cur.amount, 0);
    }

    static calculateUpcomingEarnings(transactions: Transaction[]): number {
        const now = new Date();
        return transactions
            .filter(({ date, amount }) => isSameMonth(date, now) && date > now && amount > 0)
            .reduce((prev, cur) => prev + cur.amount, 0);
    }

    static calculatePaidExpenses(transactions: Transaction[]): number {
        const now = new Date();
        return transactions
            .filter(({ amount, date }) => amount <= 0 && date <= now && isSameMonth(date, now))
            .reduce((prev, cur) => prev + Math.abs(cur.amount), 0);
    }

    static calculateUpcomingExpenses(transactions: Transaction[]): number {
        const now = new Date();
        return transactions
            .filter(({ date, amount }) => isSameMonth(date, now) && date > now && amount <= 0)
            .reduce((prev, cur) => prev + Math.abs(cur.amount), 0);
    }

    /**
     * Get the transactions, ready for the export
     */
    static export(type: ExportFormat = 'JSON'): Promise<TExportTransaction[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    supabase
                        .from(`transactions`)
                        .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    supabase
                        .from(`transactions`)
                        .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
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
