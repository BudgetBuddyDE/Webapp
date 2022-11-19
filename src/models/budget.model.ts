import { BudgetService } from '../services/budget.service';
import type { IBaseBudget, IBudgetProgressView } from '../types/budget.type';
import type { ICategoryView } from '../types/category.type';
import type { uuid } from '../types/profile.type';

export class Budget {
  private _id: number;
  private _category: ICategoryView;
  private _budget: number;
  private _currentlySpent: number;
  private _created_by: uuid;
  private _updated_at: Date;
  private _inserted_at: Date;

  constructor({
    id,
    category,
    budget,
    currentlySpent,
    created_by,
    updated_at,
    inserted_at,
  }: IBudgetProgressView) {
    this._id = id;
    this._category = category;
    this._budget = budget;
    this._currentlySpent = currentlySpent ?? 0;
    this._created_by = created_by;
    this._updated_at = new Date(updated_at);
    this._inserted_at = new Date(inserted_at);
  }

  async update(updatedInformation: { budget: number }) {
    try {
      return await BudgetService.update(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await BudgetService.deleteById(this.id);
    } catch (error) {
      console.error(error);
    }
  }

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get category(): ICategoryView {
    return this._category;
  }
  public set category(value: ICategoryView) {
    this._category = value;
  }

  public get budget(): number {
    return this._budget;
  }
  public set budget(value: number) {
    this._budget = value;
  }

  public get currentlySpent(): number {
    return this._currentlySpent;
  }
  public set currentlySpent(value: number) {
    this._currentlySpent = value;
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

export class BaseBudget {
  private _id: number;
  private _category: number;
  private _budget: number;
  private _created_by: uuid;
  private _updated_at: Date;
  private _inserted_at: Date;

  constructor({ id, category, budget, created_by, updated_at, inserted_at }: IBaseBudget) {
    this._id = id;
    this._category = category;
    this._budget = budget;
    this._created_by = created_by;
    this._updated_at = new Date(updated_at);
    this._inserted_at = new Date(inserted_at);
  }

  async update(updatedInformation: { budget: number }) {
    try {
      return await BudgetService.update(this.id, {
        ...updatedInformation,
        created_by: this.created_by,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async delete() {
    try {
      return await BudgetService.deleteById(this.id);
    } catch (error) {
      console.error(error);
    }
  }

  public get id(): number {
    return this._id;
  }
  public set id(value: number) {
    this._id = value;
  }

  public get category(): number {
    return this._category;
  }
  public set category(value: number) {
    this._category = value;
  }

  public get budget(): number {
    return this._budget;
  }
  public set budget(value: number) {
    this._budget = value;
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
