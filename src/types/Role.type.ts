import type { TCreatedAt, TDescription } from '.';

export type TRole = {
  id: number;
  name: string;
  description: TDescription;
  permissions: number;
  createdAt: TCreatedAt;
};
