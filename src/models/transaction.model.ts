import { DateTimePickerProps } from '@mui/x-date-pickers';
import { TransactionService } from '../services/transaction.service';
import type { ICategoryView } from '../types/category.type';
import type { IPaymentMethodView } from '../types/paymentMethod.type';
import type { uuid } from '../types/profile.type';
import type { IBaseTransaction, ITransaction } from '../types/transaction.type';

export class Transaction {
  private _id: number;
  private _categories: ICategoryView;
  private _paymentMethods: IPaymentMethodView;
  private _receiver: string;
  private _description: string | null;
  private _amount: number;
  private _date: Date;
  private _created_by: uuid;
  private _updated_at: Date;
  private _inserted_at: Date;

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
    this._id = id;
    this._categories = categories;
    this._paymentMethods = paymentMethods;
    this._receiver = receiver;
    this._description = description;
    this._amount = amount;
    this._date = new Date(date);
    this._created_by = created_by;
    this._updated_at = new Date(updated_at);
    this._inserted_at = new Date(inserted_at);
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

  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  public get categories(): ICategoryView {
    return this._categories;
  }
  public set categories(value: ICategoryView) {
    this._categories = value;
  }

  public get paymentMethods(): IPaymentMethodView {
    return this._paymentMethods;
  }
  public set paymentMethods(value: IPaymentMethodView) {
    this._paymentMethods = value;
  }

  public get receiver(): string {
    return this._receiver;
  }
  public set receiver(value: string) {
    this._receiver = value;
  }

  public get description(): string | null {
    return this._description;
  }
  public set description(value: string | null) {
    this._description = value;
  }

  public get amount(): number {
    return this._amount;
  }
  public set amount(value: number) {
    this._amount = value;
  }

  public get date(): Date {
    return this._date;
  }
  public set date(value: Date) {
    this._date = value;
  }

  public get created_by(): uuid {
    return this._created_by;
  }
  public set created_by(value: uuid) {
    this._created_by = value;
  }

  public get updated_at(): Date {
    return this._updated_at;
  }
  public set updated_at(value: Date) {
    this._updated_at = value;
  }

  public get inserted_at(): Date {
    return this._inserted_at;
  }
  public set inserted_at(value: Date) {
    this._inserted_at = value;
  }
}

export class BaseTransaction {
  private _id: number;
  private _category: number;
  private _paymentMethod: number;
  private _receiver: string;
  private _description: string | null;
  private _amount: number;
  private _date: Date;
  private _created_by: uuid;
  private _updated_at: Date;
  private _inserted_at: Date;

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
    this._id = id;
    this._category = category;
    this._paymentMethod = paymentMethod;
    this._receiver = receiver;
    this._description = description;
    this._amount = amount;
    this._date = new Date(date);
    this._created_by = created_by;
    this._updated_at = new Date(updated_at);
    this._inserted_at = new Date(inserted_at);
  }

  async update(updatedInformation: {
    name: string;
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

  public get id(): number {
    return this._id;
  }
  public set id(id: number) {
    this._id = id;
  }

  public get category(): number {
    return this._category;
  }
  public set category(value: number) {
    this._category = value;
  }

  public get paymentMethod(): number {
    return this._paymentMethod;
  }
  public set paymentMethod(value: number) {
    this._paymentMethod = value;
  }

  public get receiver(): string {
    return this._receiver;
  }
  public set receiver(value: string) {
    this._receiver = value;
  }

  public get description(): string | null {
    return this._description;
  }
  public set description(value: string | null) {
    this._description = value;
  }

  public get amount(): number {
    return this._amount;
  }
  public set amount(value: number) {
    this._amount = value;
  }

  public get date(): Date {
    return this._date;
  }
  public set date(value: Date) {
    this._date = value;
  }

  public get created_by(): uuid {
    return this._created_by;
  }
  public set created_by(value: uuid) {
    this._created_by = value;
  }

  public get updated_at(): Date {
    return this._updated_at;
  }
  public set updated_at(value: Date) {
    this._updated_at = value;
  }

  public get inserted_at(): Date {
    return this._inserted_at;
  }
  public set inserted_at(value: Date) {
    this._inserted_at = value;
  }
}
