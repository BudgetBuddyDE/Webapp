import type { TPaymentMethod } from '@/types';

export function getPaymentMethodFromList(
  paymentMethodId: number,
  paymentMethods: TPaymentMethod[]
): { label: string; value: number } | undefined {
  const match = paymentMethods.find((paymentMethod) => paymentMethod.id === paymentMethodId);
  if (!match) return undefined;
  return { label: `${match.name} • ${match.provider}`, value: match.id };
}
