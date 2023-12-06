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

export type TCreateTransactionPayload = {
  owner: TTransaction['owner']['uuid'];
  categoryId: TTransaction['category']['id'];
  paymentMethodId: TTransaction['paymentMethod']['id'];
} & Pick<TTransaction, 'processedAt' | 'receiver' | 'description' | 'transferAmount'>;

export type TUpdateTransactionPayload = {
  transactionId: TTransaction['id'];
  categoryId: TTransaction['category']['id'];
  paymentMethodId: TTransaction['paymentMethod']['id'];
} & Pick<TTransaction, 'processedAt' | 'receiver' | 'description' | 'transferAmount'>;

export type TDeleteTransactionPayload = { transactionId: TTransaction['id'] };
