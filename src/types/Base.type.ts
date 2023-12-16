import { z } from 'zod';

export const ZDescription = z
  .string()
  .nullable()
  .transform((val) => (val === '' ? null : val));
export type TDescription = z.infer<typeof ZDescription>;

export const ZCreatedAt = z
  .date()
  .or(z.number())
  .transform((val) => new Date(val));
export type TCreatedAt = z.infer<typeof ZCreatedAt>;

export interface IFetchDataHook<T> {
  loading: boolean;
  fetched: boolean;
  data: T;
  refresh: () => Promise<void>;
  error: Error | null;
}
