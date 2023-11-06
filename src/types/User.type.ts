import type { TCreatedAt } from '.';

export type TUser = {
  uuid: string;
  email: string;
  name: string;
  surname: string;
  password: string;
  createdAt: TCreatedAt;
};
