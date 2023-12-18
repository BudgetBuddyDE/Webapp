import { z } from 'zod';
import { ZRole } from './Role.type';
import { ZCreatedAt } from './index';

export const ZUser = z.object({
  uuid: z.string().uuid(),
  role: ZRole,
  email: z.string().email(),
  name: z.string(),
  surname: z.string(),
  password: z.string(),
  createdAt: ZCreatedAt,
});
export type TUser = z.infer<typeof ZUser>;

export const ZUpdateUserPayload = z.object({
  uuid: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  surname: z.string(),
});
export type TUpdateUserPayload = z.infer<typeof ZUpdateUserPayload>;
