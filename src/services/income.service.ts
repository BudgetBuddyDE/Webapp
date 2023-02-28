import { supabase } from '../supabase';
import type { DailyIncome, IIncome } from '../types/';

export class IncomeService {
  static async getAllTimeIncome(userId: string): Promise<IIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IIncome>('AllTimeIncome').select('*').eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getCurrentMonthIncome(userId: string): Promise<IIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.from<IIncome>('CurrentMonthIncome').select('*').eq('created_by', userId);
      if (error) rej(error);
      res(data);
    });
  }

  static async getDailyIncome(startDate: Date, endDate: Date): Promise<DailyIncome[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase.rpc<DailyIncome>('get_daily_transactions', {
        requested_data: 'INCOME',
        end_date: endDate,
        start_date: startDate,
      });
      if (error) rej(error);
      res(data);
    });
  }

  static async getIncome(userId: string, startDate: Date, endDate: Date): Promise<IIncome[] | null> {
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
