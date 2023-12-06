export type ExportFormat = 'JSON' | 'CSV';
export type SupabaseData<T = any> = T | null;

export type uuid = string;
export type Description = string | null;

export * from './authentification.type';
export * from './budget.type';
export * from './category.type';
export * from './context.type';
export * from './earning.type';
export * from './expense.type';
export * from './feedback.type';
export * from './filter.type';
export * from './payment-method.type';
export * from './subscription.type';
export * from './transaction.type';
