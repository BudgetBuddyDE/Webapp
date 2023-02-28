import { supabase } from '../supabase';
import type { DailySpending, IExpense } from '../types';

export class ExpenseService {
  static async getAllTimeExpenses(userId: string): Promise<IExpense[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IExpense>('AllTimeExpenses').select('*').eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getCurrentMonthExpenses(userId: string): Promise<IExpense[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IExpense>('CurrentMonthExpenses')
        .select('*')
        .eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getDailyExpenses(startDate: Date, endDate: Date): Promise<DailySpending[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.rpc<DailySpending>('get_daily_transactions', {
        requested_data: 'SPENDINGS',
        end_date: endDate,
        start_date: startDate,
      });
      if (error) rej(error);
      res(data && typeof data === 'object' ? data.map((day) => ({ ...day, amount: Math.abs(day.amount) })) : null);
    });
  }

  static async getExpenses(userId: string, startDate: Date, endDate: Date): Promise<IExpense[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.rpc('getExpenses', {
        endDate: endDate,
        startDate: startDate,
        userId: userId,
      });
      if (error) rej(error);
      res(data);
    });
  }
}
