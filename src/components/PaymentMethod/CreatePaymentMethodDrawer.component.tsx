import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import { PaymentMethod } from '@/models/PaymentMethod.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { PaymentMethodService } from '@/services/PaymentMethod.service';
import { FormStyle } from '@/style/Form.style';
import type { PaymentMethodTable } from '@/type/payment-method.type';
import { sleep } from '@/util/sleep.util';
import { TextField } from '@mui/material';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';

export interface ICreatePaymentMethodProps {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (paymentMethod: PaymentMethod) => void;
    paymentMethod?: Partial<PaymentMethodTable>;
}

export const CreatePaymentMethod: React.FC<ICreatePaymentMethodProps> = ({
    open,
    setOpen,
    afterSubmit,
    paymentMethod,
}) => {
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { refresh } = useFetchPaymentMethods();
    const [form, setForm] = React.useState<Partial<PaymentMethodTable>>({});
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler = {
        onClose: () => {
            setOpen(false);
            setForm({});
            setDrawerAction({ type: 'RESET' });
        },
        inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setDrawerAction({ type: 'SUBMIT' });
            const values = Object.keys(form);
            const missingValues = ['name', 'address', 'provider'].filter((value) => !values.includes(value));
            try {
                if (missingValues.length > 0) {
                    throw new Error('Provide an ' + missingValues.join(', ') + '!');
                }
                const createdPaymentMethods = await PaymentMethodService.createPaymentMethods([form]);
                if (createdPaymentMethods.length < 1) throw new Error('No payment-methods created');
                const createdPaymentMethod = createdPaymentMethods[0];
                if (afterSubmit) afterSubmit(createdPaymentMethod);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                refresh();
                handler.onClose();
                showSnackbar({ message: 'Payment method added' });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            } finally {
                setDrawerAction({ type: 'RESET' });
            }
        },
    };

    React.useEffect(() => {
        if (!paymentMethod) return;
        setForm({ name: paymentMethod.name });
    }, [paymentMethod]);

    return (
        <FormDrawer
            open={open}
            heading="Add Payment Method"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Create"
            closeOnBackdropClick
        >
            <TextField
                id="payment-method-name"
                variant="outlined"
                label="Name"
                name="name"
                sx={FormStyle}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                value={form.name}
            />

            <TextField
                id="payment-method-provider"
                variant="outlined"
                label="Provider"
                name="provider"
                sx={FormStyle}
                onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))}
            />

            <TextField
                id="payment-method-address"
                variant="outlined"
                label="Address"
                name="address"
                sx={FormStyle}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            />

            <TextField
                id="payment-method-description"
                variant="outlined"
                label="Description"
                name="description"
                sx={{ ...FormStyle, mb: 0 }}
                multiline
                rows={3}
                onChange={(event) => {
                    const value = event.target.value;
                    const description = value.length > 1 ? value : null;
                    setForm((prev) => ({ ...prev, description: description }));
                }}
            />
        </FormDrawer>
    );
};
