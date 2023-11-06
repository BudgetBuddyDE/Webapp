export interface IFetchDataHook<T> {
  loading: boolean;
  fetched: boolean;
  data: T;
  refresh: () => Promise<void>;
  error: Error | null;
}
export type TDescription = string | null;
export type TCreatedAt = Date | number;

export * from './Auth.type';
export * from './ApiResponse.type';
export * from './User.type';
export * from './Category.type';
export * from './PaymentMethod.type';
export * from './Transaction.type';
export * from './Subscription.type';
export * from './Budget.type';
