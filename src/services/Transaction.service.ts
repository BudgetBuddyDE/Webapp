import { isSameMonth } from 'date-fns';
import { Transaction } from '@/models/Transaction.model';
import { TransactionTable } from '@/models/TransactionTable.model';
import { SupabaseClient } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import { DailyEarning, Earning } from '@/type/earning.type';
import { DailyExpense, Expense } from '@/type/expense.type';
import type {
    ExportTransaction,
    Transaction as TTransaction,
    TransactionTable as TTransactionTable,
} from '@/type/transaction.type';

export class TransactionService {
    private static table = 'transactions';

    static async createTransactions(transactions: Partial<TTransactionTable>[]): Promise<TransactionTable[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).insert(transactions).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransactionTable[]>;
            res(data ? data.map((category) => new TransactionTable(category)) : []);
        });
    }

    static async getTransactions(amount = 1000): Promise<Transaction[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient()
                .from(this.table)
                .select(
                    `
                    id,
                    amount,
                    receiver,
                    description, 
                    date,
                    created_by,
                    updated_at,
                    inserted_at,
                    paymentMethods (
                        id, name, address, provider, description
                    ),
                    categories (
                        id, name, description
                    )`
                )
                .order('date', { ascending: false })
                .limit(amount);
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransaction[]>;
            res(data ? data.map((category) => new Transaction(category)) : []);
        });
    }

    static async update(
        transactions: TTransactionTable['id'][],
        column: keyof Pick<TTransactionTable, 'category' | 'paymentMethod'>,
        value: TTransactionTable['category'] | TTransactionTable['paymentMethod']
    ): Promise<TransactionTable[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient()
                .from(this.table)
                .update({ [column]: value })
                .in('id', transactions)
                .select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransactionTable[]>;
            res(data ? data.map((category) => new TransactionTable(category)) : []);
        });
    }

    static async delete(transactions: TransactionTable['id'][]): Promise<TransactionTable[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().in('id', transactions).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransactionTable[]>;
            res(data ? data.map((category) => new TransactionTable(category)) : []);
        });
    }

    static async getAllTimeExpenses(userId: string): Promise<Expense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from('AllTimeExpenses').select('*').eq('created_by', userId);
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    static async getCurrentMonthExpenses(userId: string): Promise<Expense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from('CurrentMonthExpenses').select('*').eq('created_by', userId);
            if (response.error) rej(response.error);
            res(response.data as SupabaseData<Expense[]>);
        });
    }

    static async getDailyExpenses(startDate: Date, endDate: Date): Promise<DailyExpense[] | null> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().rpc('get_daily_transactions', {
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
            const response = await SupabaseClient().rpc('getExpenses', {
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
            const response = await SupabaseClient().rpc('get_daily_transactions', {
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
            const response = await SupabaseClient().rpc('getIncome', {
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
    static async updateTransaction(
        id: number,
        updatedTransaction: Partial<TTransactionTable>
    ): Promise<TransactionTable[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient()
                .from(this.table)
                .update(updatedTransaction)
                .match({ id: id })
                .select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransactionTable[]>;
            res(data ? data.map((category) => new TransactionTable(category)) : []);
        });
    }

    /**
     * @deprecated Use `Transaction.delete()` instead of the the `TransactionService.deleteTransactionById(...)`
     */
    static async deleteTransactionById(id: number): Promise<TransactionTable[]> {
        return new Promise(async (res, rej) => {
            const response = await SupabaseClient().from(this.table).delete().match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<TTransactionTable[]>;
            res(data ? data.map((category) => new TransactionTable(category)) : []);
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
            .filter(({ amount, date }) => amount > 0 && date > now && isSameMonth(date, now))
            .reduce((prev, cur) => prev + cur.amount, 0);
    }

    static calculatePaidExpenses(transactions: Transaction[]): number {
        const now = new Date();
        return transactions
            .filter(({ amount, date }) => amount <= 0 && date < now && isSameMonth(date, now))
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
    static export(type: ExportFormat = 'JSON'): Promise<ExportTransaction[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    SupabaseClient()
                        .from(`transactions`)
                        .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            // @ts-ignore
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    SupabaseClient()
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
