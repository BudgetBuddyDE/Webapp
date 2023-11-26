import type { TCreatedAt, TDescription, TUser } from '.';

export type TPaymentMethod = {
  id: number;
  owner: TUser;
  name: string;
  address: string;
  description: TDescription;
  createdAt: TCreatedAt;
};

export type TCreatePaymentMethodPayload = {
  owner: TUser['uuid'];
} & Pick<TPaymentMethod, 'name' | 'address' | 'description'>;

export type TUpdatePaymentMethodPayload = Pick<
  TPaymentMethod,
  'id' | 'name' | 'address' | 'description'
>;

export type TDeletePaymentMethodPayload = { paymentMethodId: TPaymentMethod['id'] };
