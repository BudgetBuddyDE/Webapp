import { PaymentMethodService } from '../services/payment-method.service';
import type { IBasePaymentMethod } from '../types/paymentMethod.type';
import type { uuid } from '../types/profile.type';

export class PaymentMethod {
  private _id: number;
  private _name: string;
  private _provider: string;
  private _address: string;
  private _description: string | null;
  private _created_by: uuid;
  private _updated_at: Date;
  private _inserted_at: Date;

  constructor({
    id,
    name,
    provider,
    address,
    description,
    created_by,
    updated_at,
    inserted_at,
  }: IBasePaymentMethod) {
    this._id = id;
    this._name = name;
    this._provider = provider;
    this._address = address;
    this._description = description;
    this._created_by = created_by;
    this._updated_at = new Date(updated_at);
    this._inserted_at = new Date(inserted_at);
  }

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get provider(): string {
    return this._provider;
  }
  public set provider(value: string) {
    this._provider = value;
  }

  public get address(): string {
    return this._address;
  }
  public set address(value: string) {
    this._address = value;
  }

  public get description(): string | null {
    return this._description;
  }
  public set description(value: string | null) {
    this._description = value;
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

  async update(updatedInformation: {
    name: string;
    address: string;
    provider: string;
    description: string | null;
  }) {
    try {
      return await PaymentMethodService.updatePaymentMethod(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await PaymentMethodService.deletePaymentMethodById(this.id);
    } catch (error) {
      console.error(error);
    }
  }
}
