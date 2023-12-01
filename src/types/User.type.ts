import type { TCreatedAt } from '.';
import type { TRole } from './Role.type';

export type TUser = {
  uuid: string;
  role: TRole;
  email: string;
  name: string;
  surname: string;
  password: string;
  createdAt: TCreatedAt;
};

export type TUpdateUserPayload = Pick<TUser, 'uuid' | 'email' | 'name' | 'surname'>;
