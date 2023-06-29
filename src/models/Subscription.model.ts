import { SubscriptionService } from '@/services/Subscription.service';
import type { Description, uuid } from '@/type';
import type { CategoryView } from '@/type/category.type';
import type { PaymentMethodView } from '@/type/payment-method.type';
import type { TSubscription } from '@/type/subscription.type';
import { determineNextExecution, determineNextExecutionDate } from '@/util/determineNextExecution.util';

export class Subscription {
    id: number;
    categories: CategoryView;
    paymentMethods: PaymentMethodView;
    receiver: string;
    description: Description;
    amount: number;
    execute_at: number;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({
        id,
        categories,
        paymentMethods,
        receiver,
        description,
        amount,
        execute_at,
        created_by,
        updated_at,
        inserted_at,
    }: TSubscription) {
        this.id = id;
        this.categories = categories;
        this.paymentMethods = paymentMethods;
        this.receiver = receiver;
        this.description = description;
        this.amount = amount;
        this.execute_at = execute_at;
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    async update(updatedInformation: {
        execute_at: number;
        receiver: string;
        category: number;
        paymentMethod: number;
        amount: number;
        description: string | null;
    }) {
        try {
            return await SubscriptionService.updateSubscription(this.id, {
                ...updatedInformation,
                created_by: this.created_by,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async delete() {
        try {
            return await SubscriptionService.deleteSubscriptionById(this.id);
        } catch (error) {
            console.error(error);
        }
    }

    determineNextExecution(): string {
        return determineNextExecution(this.execute_at);
    }

    determineNextExecutionDate(): Date {
        return determineNextExecutionDate(this.execute_at);
    }
}
