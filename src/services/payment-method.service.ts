import { supabase } from '../supabase';
import type { IPaymentMethod } from '../types/transaction.interface';
import type { TExportType } from '../components/user-profile.component';

export class PaymentMethodService {
  private static table = 'paymentMethods';

  static async createPaymentMethods(
    paymentMethods: IPaymentMethod[]
  ): Promise<IPaymentMethod[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IPaymentMethod>(this.table)
        .insert(paymentMethods);
      if (error) rej(error);
      res(data);
    });
  }

  static async getPaymentMethods(): Promise<IPaymentMethod[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IPaymentMethod>(this.table)
        .select('*')
        .order('name', { ascending: true });
      if (error) rej(error);
      res(data);
    });
  }

  static async updatePaymentMethod(
    id: number,
    updatedPaymentMethod: Partial<IPaymentMethod>
  ): Promise<IPaymentMethod[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IPaymentMethod>(this.table)
        .update(updatedPaymentMethod)
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  static async deletePaymentMethodById(id: number): Promise<IPaymentMethod[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IPaymentMethod>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  /**
   * Get all payment-methods, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<IPaymentMethod[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from<IPaymentMethod>(this.table)
            .select(`*`)
            .then((result) => {
              if (result.error) rej(result.error);
              res(result.data ?? []);
            });
          break;

        case 'csv':
          supabase
            .from<IPaymentMethod>(this.table)
            .select(`*`)
            .csv()
            .then((result) => {
              if (result.error) rej(result.error);
              res(result.data ?? '');
            });
          break;
      }
    });
  }
}
