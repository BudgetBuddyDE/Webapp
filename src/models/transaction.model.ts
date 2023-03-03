import { TransactionService } from '../services/';
import type { IBaseTransaction, ICategoryView, IPaymentMethodView, ITransaction, uuid } from '../types';

export class Transaction {
  id: number;
  categories: ICategoryView;
  paymentMethods: IPaymentMethodView;
  receiver: string;
  description: string | null;
  amount: number;
  date: Date;
  created_by: uuid;
  updated_at: Date;
  inserted_at: Date;

  constructor({
    id,
    categories,
    paymentMethods,
    receiver,
    description,
    amount,
    date,
    created_by,
    updated_at,
    inserted_at,
  }: ITransaction) {
    this.id = id;
    this.categories = categories;
    this.paymentMethods = paymentMethods;
    this.receiver = receiver;
    this.description = description;
    this.amount = amount;
    this.date = new Date(date);
    this.created_by = created_by;
    this.updated_at = new Date(updated_at);
    this.inserted_at = new Date(inserted_at);
  }

  async update(updatedInformation: {
    date: Date;
    receiver: string;
    category: number;
    paymentMethod: number;
    amount: number;
    description: string | null;
  }) {
    try {
      return await TransactionService.updateTransaction(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await TransactionService.deleteTransactionById(this.id);
    } catch (error) {
      console.error(error);
    }
  }
}

export class BaseTransaction {
  id: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  description: string | null;
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
  }: IBaseTransaction) {
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

  async update(updatedInformation: {
    date: Date;
    receiver: string;
    category: number;
    paymentMethod: number;
    amount: number;
    description: string | null;
  }) {
    try {
      return await TransactionService.updateTransaction(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await TransactionService.deleteTransactionById(this.id);
    } catch (error) {
      console.error(error);
    }
  }
}
