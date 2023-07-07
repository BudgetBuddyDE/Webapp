import { TransactionService } from '@/services/Transaction.service';
import { supabase } from '@/supabase';
import type { Description, SupabaseData, uuid } from '@/type';
import type { CategoryView } from '@/type/category.type';
import type { PaymentMethodView } from '@/type/payment-method.type';
import type { TTransaction, TUpdateTransactionProps } from '@/type/transaction.type';

export class Transaction {
    id: number;
    categories: CategoryView;
    paymentMethods: PaymentMethodView;
    receiver: string;
    description: Description;
    amount: number;
    date: Date;
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
        date,
        created_by,
        updated_at,
        inserted_at,
    }: TTransaction) {
        this.id = id;
        this.categories = categories;
        this.paymentMethods = paymentMethods;
        this.receiver = receiver;
        this.description = description;
        this.amount = amount;
        this.date = new Date(date);
        this.created_by = created_by;
        this.updated_at = new Date(updated_at);
        this.inserted_at = new Date(inserted_at);
    }

    getValuesForUpdate(): TUpdateTransactionProps {
        return {
            id: this.id,
            amount: this.amount,
            category: this.categories.id,
            date: this.date,
            description: this.description,
            paymentMethod: this.paymentMethods.id,
            receiver: this.receiver,
        };
    }

    async update({
        description,
        ...otherFields
    }: Omit<TUpdateTransactionProps, 'id'>): Promise<[Transaction | null, Error | null]> {
        try {
            const { data, error } = await supabase
                .from(TransactionService.getTableName())
                .update({
                    ...otherFields,
                    description: description == null || description.length == 0 ? null : description,
                })
                .match({ id: this.id })
                .select(TransactionService.getSelectQuery());
            if (error) return [null, new Error(error.message)];
            // @ts-expect-error
            const updatedTransactions = data as SupabaseData<TTransaction[]>;
            if (updatedTransactions && updatedTransactions.length > 0) {
                const { id, categories, paymentMethods, receiver, description, amount, date, updated_at, inserted_at } =
                    updatedTransactions[0];
                this.id = id;
                this.categories = categories;
                this.paymentMethods = paymentMethods;
                this.receiver = receiver;
                this.description = description;
                this.amount = amount;
                this.date = new Date(date);
                this.updated_at = new Date(updated_at);
                this.inserted_at = new Date(inserted_at);

                return [this, null];
            }
            return [null, new Error('Changes could not be saved')];
        } catch (error) {
            return [null, error as Error];
        }
    }

    async delete() {
        return await TransactionService.delete([this.id]);
    }
}
