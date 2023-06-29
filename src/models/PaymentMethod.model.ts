import { PaymentMethodService } from '@/services/PaymentMethod.service';
import type { Description, uuid } from '@/type';
import { PaymentMethodTable, PaymentMethodView } from '@/type/payment-method.type';

export class PaymentMethod {
    id: number;
    name: string;
    provider: string;
    address: string;
    description: Description;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({ id, name, provider, address, description, created_by, updated_at, inserted_at }: PaymentMethodTable) {
        this.id = id;
        this.name = name;
        this.provider = provider;
        this.address = address;
        this.description = description;
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    get paymentMethodView() {
        const view: PaymentMethodView = {
            id: this.id,
            name: this.name,
            address: this.address,
            provider: this.provider,
            description: this.description,
        };
        return view;
    }

    async update(updatedInformation: { name: string; address: string; provider: string; description: string | null }) {
        try {
            return await PaymentMethodService.updatePaymentMethod(this.id, {
                ...updatedInformation,
                created_by: this.created_by,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async delete() {
        try {
            return await PaymentMethodService.deletePaymentMethodById(this.id);
        } catch (error) {
            console.error(error);
        }
    }
}
