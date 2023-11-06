import type { TCategory, TCreatedAt, TDescription, TPaymentMethod, TUser } from '.';

export type TTransaction = {
  id: number;
  owner: TUser;
  category: TCategory;
  paymentMethod: TPaymentMethod;
  processedAt: TCreatedAt;
  receiver: string;
  description: TDescription;
  transferAmount: number;
  createdAt: TCreatedAt;
};
