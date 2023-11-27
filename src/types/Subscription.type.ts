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

export type TCreateSubscriptionPayload = {
  owner: TSubscription['owner']['uuid'];
  categoryId: TSubscription['category']['id'];
  paymentMethodId: TSubscription['paymentMethod']['id'];
} & Pick<TSubscription, 'paused' | 'executeAt' | 'receiver' | 'description' | 'transferAmount'>;

export type TUpdateSubscriptionPayload = {
  subscriptionId: TSubscription['id'];
  categoryId: TSubscription['category']['id'];
  paymentMethodId: TSubscription['paymentMethod']['id'];
} & Pick<TSubscription, 'paused' | 'executeAt' | 'receiver' | 'description' | 'transferAmount'>;

export type TDeleteSubscriptionPayload = { subscriptionId: TSubscription['id'] };
