import { supabase } from '../supabase';
import type { IBaseTransactionDTO, ITransaction } from '../types/transaction.interface';

export class TransactionService {
  private static table = 'transactions';

  static async createTransactions(
    transactions: IBaseTransactionDTO[]
  ): Promise<IBaseTransactionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseTransactionDTO>(this.table)
        .insert(transactions);
      if (error) rej(error);
      res(data);
    });
  }

  static async getTransactions(): Promise<ITransaction[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<ITransaction>(this.table)
        .select(
          `
          id,
          amount,
          receiver,
          description, 
          date,
          updated_at,
          inserted_at,
          paymentMethods (
            id, name, address, provider, description
          ),
          categories (
            id, name, description
          )`
        )
        .order('date', { ascending: false });
      if (error) rej(error);
      res(data);
    });
  }

  static async updateTransaction(
    id: number,
    updatedTransaction: Partial<IBaseTransactionDTO>
  ): Promise<IBaseTransactionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseTransactionDTO>(this.table)
        .update(updatedTransaction)
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }

  static async deleteTransactionById(id: number): Promise<IBaseTransactionDTO[] | null> {
    return new Promise(async (res, rej) => {
      const { data, error } = await supabase
        .from<IBaseTransactionDTO>(this.table)
        .delete()
        .match({ id: id });
      if (error) rej(error);
      res(data);
    });
  }
}
