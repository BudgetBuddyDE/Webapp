import type { TCreatedAt, TDescription } from '.';
import type { TUser } from './User.type';

export type TCategory = {
  id: number;
  owner: TUser;
  name: string;
  description: TDescription;
  createdAt: TCreatedAt;
};

export type TCreateCategoryPayload = {
  owner: TUser['uuid'];
} & Pick<TCategory, 'name' | 'description'>;

export type TUpdateCategoryPayload = Pick<TCategory, 'id' | 'name' | 'description'>;

export type TDeleteCategoryPayload = Pick<TCategory, 'id'>;
