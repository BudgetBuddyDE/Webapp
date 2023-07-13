import { SubscriptionService } from '@/services/Subscription.service';
import type { Description, uuid } from '@/type';
import type { TBaseSubscription } from '@/type/subscription.type';
import { determineNextExecution, determineNextExecutionDate } from '@/util/determineNextExecution.util';

export class BaseSubscription {
    id: number;
    paused: boolean;
    category: number;
    paymentMethod: number;
    receiver: string;
    description: Description;
    amount: number;
    execute_at: number;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({
        id,
        paused,
        category,
        paymentMethod,
        receiver,
        description,
        amount,
        execute_at,
        created_by,
        updated_at,
        inserted_at,
    }: TBaseSubscription) {
        this.id = id;
        this.paused = paused;
        this.category = category;
        this.paymentMethod = paymentMethod;
        this.receiver = receiver;
        this.description = description;
        this.amount = amount;
        this.execute_at = execute_at;
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    async update(updatedInformation: Omit<TBaseSubscription, 'id' | 'inserted_at' | 'updated_at' | 'created_by'>) {
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
