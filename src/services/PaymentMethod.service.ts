import { PaymentMethod } from '@/models/PaymentMethod.model';
import { supabase } from '@/supabase';
import type { ExportFormat, SupabaseData } from '@/type';
import type { ExportPaymentMethod, PaymentMethodTable, PaymentMethodView } from '@/type/payment-method.type';

export class PaymentMethodService {
    private static table = 'paymentMethods';

    static async createPaymentMethods(paymentMethods: Partial<PaymentMethodTable>[]): Promise<PaymentMethod[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).insert(paymentMethods).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<PaymentMethodTable[]>;
            res(data ? data.map((paymentMethod) => new PaymentMethod(paymentMethod)) : []);
        });
    }

    static async getPaymentMethods(): Promise<PaymentMethod[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).select('*').order('name', { ascending: true });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<PaymentMethodTable[]>;
            res(data ? data.map((paymentMethod) => new PaymentMethod(paymentMethod)) : []);
        });
    }

    static async delete(paymentMethods: PaymentMethodTable['id'][]): Promise<PaymentMethod[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).delete().in('id', paymentMethods).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<PaymentMethodTable[]>;
            res(data ? data.map((paymentMethod) => new PaymentMethod(paymentMethod)) : []);
        });
    }

    /**
     * @deprecated Use `PaymentMethod.update()` instead of the the `PaymentMethodService.updatePaymentMethod(...)`
     */
    static async updatePaymentMethod(
        id: number,
        updatedPaymentMethod: Partial<PaymentMethodTable>
    ): Promise<PaymentMethod[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).update(updatedPaymentMethod).match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<PaymentMethodTable[]>;
            res(data ? data.map((paymentMethod) => new PaymentMethod(paymentMethod)) : []);
        });
    }

    /**
   * @deprecated Use `PaymentMethod.delete()` instead of the the `PaymentMethodService.deletePaymentMethodById(...)`

  */
    static async deletePaymentMethodById(id: number): Promise<PaymentMethod[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.from(this.table).delete().match({ id: id }).select();
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<PaymentMethodTable[]>;
            res(data ? data.map((paymentMethod) => new PaymentMethod(paymentMethod)) : []);
        });
    }

    /**
     * Get all payment-methods, ready for the export
     */
    static export(type: ExportFormat = 'JSON'): Promise<ExportPaymentMethod[] | string> {
        return new Promise((res, rej) => {
            switch (type) {
                case 'JSON':
                    supabase
                        .from(this.table)
                        .select(`*`)
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? []);
                        });
                    break;

                case 'CSV':
                    supabase
                        .from(this.table)
                        .select(`*`)
                        .csv()
                        .then((result) => {
                            if (result.error) rej(result.error);
                            res(result.data ?? '');
                        });
                    break;
            }
        });
    }

    static getStats(
        type: 'COUNT' | 'EARNINGS' | 'SPENDINGS'
    ): Promise<{ value: number; paymentMethod: PaymentMethodView }[]> {
        return new Promise(async (res, rej) => {
            const response = await supabase.rpc('get_pm_stats', { type: type });
            if (response.error) rej(response.error);
            const data = response.data as SupabaseData<
                {
                    value: number;
                    paymentMethod: PaymentMethodView;
                }[]
            >;
            res(data ?? []);
        });
    }
}
