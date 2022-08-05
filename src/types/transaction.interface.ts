export interface IBaseTransactionDTO {
  id?: number;
  category: number;
  paymentMethod: number;
  receiver: string;
  amount: number;
  description: string | null;
  date: Date;
}

export interface IBaseTransaction {
  categories: ICategory;
  paymentMethods: IPaymentMethod;
  receiver: string;
  amount: number;
  description: string | null;
  date: Date;
}

export interface ITransaction extends IBaseTransaction {
  id: number;
  created_by?: string;
  updated_at?: Date;
  inserted_at?: Date;
}

// TODO: Add budget to ICategories
export interface IBaseCategory {
  name: string;
  description: string | null;
}

export interface ICategory extends IBaseCategory {
  id: number;
  created_by?: string;
  updated_at?: Date;
  inserted_at?: Date;
}

export interface IBasePaymentMethod {
  name: string;
  provider: string;
  address: string;
  description: string | null;
}

export interface IPaymentMethod extends IBasePaymentMethod {
  id: number;
  created_by?: string;
  updated_at?: Date;
  inserted_at?: Date;
}
