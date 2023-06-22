import { Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context/';
import { useFetchTransactions, useScreenSize } from '../../hooks/';
import { BaseTransaction } from '../../models/';
import { DrawerActionReducer, generateInitialDrawerActionState } from '../../reducer';
import { TransactionService } from '../../services/';
import { FormStyle } from '../../theme/form-style';
import type { IBaseTransaction } from '../../types/';
import { sleep, transformBalance } from '../../utils/';
import { FormDrawer } from '../Base/';
import { CreateCategoryInput } from '../Category';
import { ReceiverAutocomplete } from '../Inputs/';
import { CreatePaymentMethodInput } from '../PaymentMethod';

export interface ICreateTransactionProps {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (transaction: BaseTransaction) => void;
}

interface CreateTransactionHandler {
    onClose: () => void;
    onDateChange: (date: Date | null) => void;
    autocompleteChange: (
        event: React.SyntheticEvent<Element, Event>,
        key: 'category' | 'paymentMethod',
        value: string | number
    ) => void;
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    receiverChange: (value: string | number) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateTransaction: React.FC<ICreateTransactionProps> = ({ open, setOpen, afterSubmit }) => {
    const screenSize = useScreenSize();
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { loading, transactionReceiver } = React.useContext(StoreContext);
    const { refresh } = useFetchTransactions();
    const [form, setForm] = React.useState<Partial<IBaseTransaction>>({ date: new Date() });
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler: CreateTransactionHandler = {
        onClose: () => {
            setOpen(false);
            setForm({ date: new Date() });
            setDrawerAction({ type: 'RESET' });
        },
        onDateChange: (date) => {
            if (date) setForm((prev) => ({ ...prev, date: date ?? new Date() }));
        },
        autocompleteChange: (event, key, value) => {
            setForm((prev) => ({ ...prev, [key]: value }));
        },
        inputChange: (event) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        receiverChange: (value) => {
            setForm((prev) => ({ ...prev, receiver: String(value) }));
        },
        onSubmit: async (event) => {
            event.preventDefault();
            setDrawerAction({ type: 'SUBMIT' });
            const values = Object.keys(form);
            const missingValues = ['date', 'category', 'paymentMethod', 'receiver', 'amount'].filter(
                (value) => !values.includes(value)
            );
            try {
                if (missingValues.length > 0) {
                    throw new Error('Provide an ' + missingValues.join(', ') + '!');
                }

                const createdTransactions = await TransactionService.createTransactions([
                    {
                        date: form.date,
                        category: Number(form.category),
                        paymentMethod: Number(form.paymentMethod),
                        receiver: String(form.receiver),
                        amount: transformBalance(form.amount!.toString()),
                        description:
                            typeof form.description === 'string' && form.description.length > 0
                                ? form.description
                                : null,
                        created_by: session!.user!.id,
                    },
                ]);
                if (createdTransactions.length < 1) throw new Error('No transaction created');
                if (afterSubmit) afterSubmit(createdTransactions[0]);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                refresh();
                handler.onClose();
                showSnackbar({ message: 'Transaction added' });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    if (loading) return null;
    return (
        <FormDrawer
            open={open}
            heading="Add Transaction"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Create"
            closeOnBackdropClick
        >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                {screenSize === 'small' ? (
                    <MobileDatePicker
                        label="Date"
                        inputFormat="dd.MM.yy"
                        value={form.date || new Date()}
                        onChange={handler.onDateChange}
                        renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                    />
                ) : (
                    <DesktopDatePicker
                        label="Date"
                        inputFormat="dd.MM.yy"
                        value={form.date || new Date()}
                        onChange={handler.onDateChange}
                        renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                    />
                )}
            </LocalizationProvider>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                }}
            >
                <CreateCategoryInput
                    onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
                    sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                />

                <CreatePaymentMethodInput
                    onChange={(event, value) =>
                        handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                    }
                    sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                />
            </Box>

            <ReceiverAutocomplete
                sx={FormStyle}
                id="receiver"
                label="Receiver"
                options={transactionReceiver}
                onValueChange={handler.receiverChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="amount">Amount</InputLabel>
                <OutlinedInput
                    id="amount"
                    label="Amount"
                    name="amount"
                    inputProps={{ inputMode: 'numeric' }}
                    onChange={handler.inputChange}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                />
            </FormControl>

            <TextField
                id="description"
                variant="outlined"
                label="Description"
                name="description"
                sx={{ ...FormStyle, mb: 0 }}
                multiline
                rows={2}
                onChange={handler.inputChange}
            />
        </FormDrawer>
    );
};
