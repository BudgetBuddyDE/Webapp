export interface ITransaction {
  id: number;
  category: ICategory;
  paymentMethod: IPaymentMethod;
  receiver: string;
  amount: number;
  description: string | null;
  date: Date;
  created_at: Date;
}

// TODO: Add budget to ICategories
export interface IBaseCategory {
  name: string;
  description: string | null;
}

export interface ICategory extends IBaseCategory {
  id: number;
}

export interface IBasePaymentMethod {
  name: string;
  provider: string;
  address: string;
  description: string | null;
}

export interface IPaymentMethod extends IBasePaymentMethod {
  id: number;
}
