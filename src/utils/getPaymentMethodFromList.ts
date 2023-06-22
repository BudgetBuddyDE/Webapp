import { PaymentMethod } from '@/models/paymentMethod.model';

export function getPaymentMethodFromList(
    paymentMethodId: number,
    paymentMethods: PaymentMethod[]
): { label: string; value: number } {
    const match = paymentMethods.find((paymentMethod) => paymentMethod.id === paymentMethodId);
    if (!match) {
        const { id, name, provider } = paymentMethods[0];
        return {
            label: `${name} • ${provider}`,
            value: id,
        };
    } else return { label: `${match?.name} • ${match?.provider}`, value: match.id };
}
