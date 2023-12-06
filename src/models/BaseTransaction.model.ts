import { TransactionService } from '@/services/Transaction.service';
import { supabase } from '@/supabase';
import type { Description, SupabaseData, uuid } from '@/type';
import type { TBaseTransaction, TUpdateTransactionProps } from '@/type/transaction.type';

export class BaseTransaction {
  id: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: Description;
  amount: number;
  date: Date;
  created_by: uuid;
  updated_at: Date;
  inserted_at: Date;

  constructor({
    id,
    category,
    paymentMethod,
    receiver,
    description,
    amount,
    date,
    created_by,
    updated_at,
    inserted_at,
  }: TBaseTransaction) {
    this.id = id;
    this.category = category;
    this.paymentMethod = paymentMethod;
    this.receiver = receiver;
    this.description = description;
    this.amount = amount;
    this.date = new Date(date);
    this.created_by = created_by;
    this.updated_at = new Date(updated_at);
    this.inserted_at = new Date(inserted_at);
  }

  async update(
    updatedInformation: Omit<TUpdateTransactionProps, 'id'>
  ): Promise<[BaseTransaction | null, Error | null]> {
    try {
      const { data, error } = await supabase
        .from(TransactionService.getTableName())
        .update(updatedInformation)
        .match({ id: this.id })
        .select();
      if (error) return [null, new Error(error.message)];

      const updatedTransactions = data as SupabaseData<TBaseTransaction[]>;
      if (updatedTransactions && updatedTransactions.length > 0) {
        const { id, category, paymentMethod, receiver, description, amount, date, updated_at, inserted_at } =
          updatedTransactions[0];
        this.id = id;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.receiver = receiver;
        this.description = description;
        this.amount = amount;
        this.date = new Date(date);
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);

        return [this, null];
      }
      return [null, new Error('Changed could not be saved')];
    } catch (error) {
      return [null, error as Error];
    }
  }

  async delete() {
    return await TransactionService.delete([this.id]);
  }
}
