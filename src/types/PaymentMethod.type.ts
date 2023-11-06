import type { TCreatedAt, TDescription, TUser } from '.';

export type TPaymentMethod = {
  id: number;
  owner: TUser;
  name: string;
  address: string;
  description: TDescription;
  createdAt: TCreatedAt;
};
