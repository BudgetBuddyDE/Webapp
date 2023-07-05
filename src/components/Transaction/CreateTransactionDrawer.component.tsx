import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import { useFetchTransactions } from '@/hook/useFetchTransactions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Transaction } from '@/models/Transaction.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { TransactionService } from '@/services/Transaction.service';
import { FormStyle } from '@/style/Form.style';
import type { TCreateTransactionProps } from '@/type/transaction.type';
import { getCategoryFromList } from '@/util/getCategoryFromList.util';
import { getPaymentMethodFromList } from '@/util/getPaymentMethodFromList.util';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CategoryAutocomplete } from '../Category/CategoryAutocomplete.component';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';
import { ReceiverAutocomplete } from '../Inputs/ReceiverAutocomplete.component';
import { PaymentMethodAutocomplete } from '../PaymentMethod/PaymentMethodAutocomplete.component';

export type CreateTransactionDrawerProps = {
    open: boolean;
    transaction?: TCreateTransactionProps;
    setOpen: (show: boolean) => void;
    afterSubmit?: (transaction: Transaction) => void;
};

interface CreateTransactionDrawerHandler {
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

export const CreateTransactionDrawer: React.FC<CreateTransactionDrawerProps> = ({
    open,
    transaction,
    setOpen,
    afterSubmit,
}) => {
    const screenSize = useScreenSize();
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { transactionReceiverSet } = React.useContext(StoreContext);
    const { loading: loadingTransactions, refresh: refreshTransactions } = useFetchTransactions();
    const { categories } = useFetchCategories();
    const { paymentMethods } = useFetchPaymentMethods();
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());
    const [form, setForm] = React.useState({ date: new Date() } as TCreateTransactionProps);

    const handler: CreateTransactionDrawerHandler = {
        onClose: () => {
            setOpen(false);
            setForm({ date: new Date() } as TCreateTransactionProps);
            setDrawerAction({ type: 'RESET' });
        },
        onDateChange: (date) => {
            if (date) setForm((prev) => ({ ...prev, date: date ?? new Date() }));
        },
        autocompleteChange: (_event, key, value) => {
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
            const missingValues = ['category', 'paymentMethod', 'receiver', 'amount'].filter(
                (value) => !values.includes(value)
            );
            try {
                if (missingValues.length > 0) {
                    throw new Error('Provide an ' + missingValues.join(', ') + '!');
                }
                const [createdTransactions, error] = await TransactionService.createTransactions([
                    {
                        date: form.date,
                        category: Number(form.category),
                        paymentMethod: Number(form.paymentMethod),
                        receiver: String(form.receiver),
                        amount: transformBalance(form.amount!.toString()),
                        description: form.description,
                        created_by: session!.user!.id,
                    },
                ]);
                if (error) throw error;
                if (createdTransactions.length == 0) throw new Error("No transactions we're saved");
                afterSubmit && afterSubmit(createdTransactions[0]);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                refreshTransactions();
                handler.onClose();
                showSnackbar({ message: 'Transaction added' });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        setForm(transaction || ({ date: new Date() } as TCreateTransactionProps));
    }, [transaction]);

    if (loadingTransactions) return null;
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
                        value={form.date}
                        onChange={handler.onDateChange}
                        renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                    />
                ) : (
                    <DesktopDatePicker
                        label="Date"
                        inputFormat="dd.MM.yy"
                        value={form.date}
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
                <CategoryAutocomplete
                    onChange={(event, value) => handler.autocompleteChange(event, 'category', Number(value?.value))}
                    defaultValue={transaction ? getCategoryFromList(form.category, categories) : undefined}
                    sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                />

                <PaymentMethodAutocomplete
                    onChange={(event, value) =>
                        handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                    }
                    defaultValue={
                        transaction ? getPaymentMethodFromList(form.paymentMethod, paymentMethods) : undefined
                    }
                    sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                />
            </Box>

            <ReceiverAutocomplete
                sx={FormStyle}
                id="receiver"
                label="Receiver"
                options={transactionReceiverSet}
                onValueChange={(value) => handler.receiverChange(String(value))}
                defaultValue={transaction ? String(transaction.receiver) : undefined}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="amount">Amount</InputLabel>
                <OutlinedInput
                    id="amount"
                    label="Amount"
                    name="amount"
                    inputProps={{ inputMode: 'numeric' }}
                    onChange={handler.inputChange}
                    value={form.amount}
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
                value={form.description}
            />
        </FormDrawer>
    );
};
