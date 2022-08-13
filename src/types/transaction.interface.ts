export interface IExpense {
  sum: number;
  category: { id: number; name: string; description: string | null };
  created_by: string;
}

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

export interface ITransactioDTO extends ITransaction {
  paymentMethod: number;
  category: number;
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

export interface IBaseSubscription {
  id?: number;
  categories: ICategory;
  paymentMethods: IPaymentMethod;
  receiver: string;
  amount: number;
  description: string | null;
  execute_at: number;
}

export interface ISubscription extends IBaseSubscription {
  id: number;
  created_by: string;
  updated_at: Date;
  inserted_at: Date;
}
