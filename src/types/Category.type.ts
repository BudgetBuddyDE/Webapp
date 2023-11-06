import type { TCreatedAt, TDescription } from '.';
import type { TUser } from './User.type';

export type TCategory = {
  id: number;
  owner: TUser;
  name: string;
  description: TDescription;
  createdAt: TCreatedAt;
};
