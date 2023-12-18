import { z } from 'zod';
import type { TUser } from './User.type';

export type TSession = TUser;

export const ZSignUpPayload = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  surname: z.string(),
});
export type TSignUpPayload = z.infer<typeof ZSignUpPayload>;

export const ZSignInPayload = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type TSignInPayload = z.infer<typeof ZSignInPayload>;
