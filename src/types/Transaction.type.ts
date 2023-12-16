import { z } from 'zod';
import { ZUser } from './User.type';
import { ZCategory } from './Category.type';
import { ZPaymentMethod } from './PaymentMethod.type';
import { ZCreatedAt, ZDescription } from './Base.type';

export const ZTransaction = z.object({
  id: z.number(),
  owner: ZUser,
  category: ZCategory,
  paymentMethod: ZPaymentMethod,
  processedAt: ZCreatedAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
  createdAt: ZCreatedAt,
});
export type TTransaction = z.infer<typeof ZTransaction>;

export const ZCreateTransactionPayload = z.object({
  owner: z.string().uuid(),
  categoryId: z.number(),
  paymentMethodId: z.number(),
  processedAt: ZCreatedAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
});
export type TCreateTransactionPayload = z.infer<typeof ZCreateTransactionPayload>;

export const ZUpdateTransactionPayload = z.object({
  transactionId: z.number(),
  categoryId: z.number(),
  paymentMethodId: z.number(),
  processedAt: ZCreatedAt,
  receiver: z.string(),
  description: ZDescription,
  transferAmount: z.number(),
});
export type TUpdateTransactionPayload = z.infer<typeof ZUpdateTransactionPayload>;

export const ZDeleteTransactionPayload = z.object({
  transactionId: z.number(),
});
export type TDeleteTransactionPayload = z.infer<typeof ZDeleteTransactionPayload>;
