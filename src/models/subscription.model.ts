import { SubscriptionService } from '@/services/subscription.service';
import type { IBaseSubscription, ICategoryView, IPaymentMethodView, ISubscription, uuid } from '@/types';

export class Subscription {
    id: number;
    categories: ICategoryView;
    paymentMethods: IPaymentMethodView;
    receiver: string;
    description: string | null;
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
    }: ISubscription) {
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
}

export class BaseSubscription {
    id: number;
    category: number;
    paymentMethod: number;
    receiver: string;
    description: string | null;
    amount: number;
    execute_at: number;
    created_by: uuid;
    updated_at: Date;
    inserted_at: Date;

    constructor({
        id,
        category,
        paymentMethod,
        receiver,
        description,
        amount,
        execute_at,
        created_by,
        updated_at,
        inserted_at,
    }: IBaseSubscription) {
        this.id = id;
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

    async update(updatedInformation: {
        execute_at: number;
        name: string;
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
}
