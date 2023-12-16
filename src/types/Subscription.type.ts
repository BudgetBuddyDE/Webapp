import { z } from 'zod';
import { ZUser } from './User.type';
import { ZCategory } from './Category.type';
import { ZPaymentMethod } from './PaymentMethod.type';
import { ZCreatedAt, ZDescription } from './Base.type';

const ZExecuteAt = z
  .number()
  .min(0, { message: 'Execution-Day must be greater than 0' })
  .max(31, { message: 'Execution-Day must be less than 32' });

export const ZSubscription = z.object({
  id: z.number(),
  owner: ZUser,
  category: ZCategory,
  paymentMethod: ZPaymentMethod,
  paused: z.boolean(),
  executeAt: ZExecuteAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
  createdAt: ZCreatedAt,
});
export type TSubscription = z.infer<typeof ZSubscription>;

export const ZCreateSUbcriptionPayload = z.object({
  owner: z.string().uuid(),
  categoryId: z.number(),
  paymentMethodId: z.number(),
  paused: z.boolean(),
  executeAt: ZExecuteAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
});
export type TCreateSubscriptionPayload = z.infer<typeof ZCreateSUbcriptionPayload>;

export const ZUpdateSubscriptionPayload = z.object({
  subscriptionId: z.number(),
  categoryId: z.number(),
  paymentMethodId: z.number(),
  paused: z.boolean(),
  executeAt: ZExecuteAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
});
export type TUpdateSubscriptionPayload = z.infer<typeof ZUpdateSubscriptionPayload>;

export const ZDeleteSubscriptionPayload = z.object({
  subscriptionId: z.number(),
});
export type TDeleteSubscriptionPayload = z.infer<typeof ZDeleteSubscriptionPayload>;
