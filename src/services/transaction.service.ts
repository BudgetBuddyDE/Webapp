import { isSameMonth } from 'date-fns';
import { supabase } from '../supabase';
import type { IBaseTransactionDTO, ITransaction } from '../types/transaction.interface';
import type { TExportType } from '../components/user-profile.component';

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

  /**
   * Get all income for the month which the user have received
   */
  static getCurrentMonthIncome(transactions: ITransaction[]) {
    const now = new Date();
    return Math.abs(
      transactions
        .filter(
          (transaction) =>
            isSameMonth(new Date(transaction.date), now) &&
            new Date(transaction.date) <= now &&
            transaction.amount > 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get income for this month which hasn't been processed  till today
   */
  static getFutureIncome(transactions: ITransaction[]) {
    const now = new Date();
    return Math.abs(
      transactions
        .filter(
          (transaction) =>
            isSameMonth(new Date(transaction.date), now) &&
            new Date(transaction.date) > now &&
            transaction.amount > 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get all spendings for the month which the user have fullfilled
   */
  static getCurrentMonthSpendings(transactions: ITransaction[]) {
    const now = new Date();
    return Math.abs(
      transactions
        .filter(
          (transaction) =>
            isSameMonth(new Date(transaction.date), now) &&
            new Date(transaction.date) <= now &&
            transaction.amount < 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get spendings for this month which hasn't been processed till today
   */
  static getFutureSpendings(transactions: ITransaction[]) {
    const now = new Date();
    return Math.abs(
      transactions
        .filter(
          (transaction) =>
            isSameMonth(new Date(transaction.date), now) &&
            new Date(transaction.date) > now &&
            transaction.amount < 0
        )
        .reduce((prev, cur) => prev + cur.amount, 0)
    );
  }

  /**
   * Get the transactions, ready for the export
   */
  static export(type: TExportType = 'json'): Promise<IBaseTransactionDTO[] | string> {
    return new Promise((res, rej) => {
      switch (type) {
        case 'json':
          supabase
            .from(`transactions`)
            .select(`*, categories:category(*), paymentMethods:paymentMethod(*)`)
            .then((result) => {
              if (result.error) rej(result.error);
              // @ts-ignore
              res(result.data ?? []);
            });
          break;

        case 'csv':
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
