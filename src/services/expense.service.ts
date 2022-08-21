import { format } from 'date-fns';
import { IDailyTransaction } from '../components/area-chart.component';
import { supabase } from '../supabase';
import { IExpense } from '../types/transaction.interface';

export class ExpenseService {
  static async getAllTimeExpenses(userId: string): Promise<IExpense[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IExpense>('AllTimeExpenses')
        .select('*')
        .eq('created_by', userId);
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

  static async getDailyExpenses(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IDailyTransaction[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IDailyTransaction>('DailyExpense')
        .select('*')
        .eq('created_by', userId)
        .gte('date', format(startDate, 'yyyy/MM/dd'))
        .lte('date', format(endDate, 'yyyy/MM/dd'));
      if (error) rej(error);
      res(data);
    });
  }

  static async getExpenses(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IExpense[] | null> {
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
