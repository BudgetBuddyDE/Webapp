import type { TCategory, TCreatedAt, TDescription, TPaymentMethod, TUser } from '.';

export type TSubscription = {
  id: number;
  owner: TUser;
  category: TCategory;
  paymentMethod: TPaymentMethod;
  paused: boolean;
  executeAt: number;
  receiver: string;
  description: TDescription;
  transferAmount: number;
  createdAt: TCreatedAt;
};
