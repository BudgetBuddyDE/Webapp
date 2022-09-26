import { format } from 'date-fns';
import { IDailyTransaction } from '../components/charts/area-chart.component';
import { supabase } from '../supabase';
import { IIncome } from '../types/transaction.interface';

export class IncomeService {
  static async getAllTimeIncome(userId: string): Promise<IIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IIncome>('AllTimeIncome')
        .select('*')
        .eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getCurrentMonthIncome(userId: string): Promise<IIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IIncome>('CurrentMonthIncome')
        .select('*')
        .eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getDailyIncome(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IDailyTransaction[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IDailyTransaction>('DailyIncome')
        .select('*')
        .eq('created_by', userId)
        .gte('date', format(startDate, 'yyyy/MM/dd'))
        .lte('date', format(endDate, 'yyyy/MM/dd'));
      if (error) rej(error);
      res(data);
    });
  }

  static async getIncome(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.rpc('getIncome', {
        endDate: endDate,
        startDate: startDate,
        userId: userId,
      });
      if (error) rej(error);
      res(data);
    });
  }
}
