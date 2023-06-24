import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import { useFetchTransactions } from '@/hook/useFetchTransactions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Transaction } from '@/models/Transaction.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { FormStyle } from '@/style/Form.style';
import { Description } from '@/type';
import { TransactionTable } from '@/type/transaction.type';
import { getCategoryFromList } from '@/util/getCategoryFromList.util';
import { getPaymentMethodFromList } from '@/util/getPaymentMethodFromList.util';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { Autocomplete, Box, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CreateCategoryAlert } from '../Category/CreateCategoryAlert.component';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';
import { ReceiverAutocomplete } from '../Inputs/ReceiverAutocomplete.component';
import { CreatePaymentMethodAlert } from '../PaymentMethod/CreatePaymentMethodAlert.component';

export type EditTransactionDrawerProps = {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (transaction: Transaction) => void;
    transaction: Transaction | null;
};

interface EditTransactionHandler {
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

export const EditTransactionDrawer: React.FC<EditTransactionDrawerProps> = ({
    open,
    setOpen,
    afterSubmit,
    transaction,
}) => {
    const screenSize = useScreenSize();
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { transactionReceiverSet } = React.useContext(StoreContext);
    const { loading: loadingTransactions, refresh: refreshTransactions } = useFetchTransactions();
    const fetchCategories = useFetchCategories();
    const fetchPaymentMethods = useFetchPaymentMethods();
    const [form, setForm] = React.useState<Partial<TransactionTable> | null>(null);
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler: EditTransactionHandler = {
        onClose: () => {
            setOpen(false);
            setForm(null);
        },
        onDateChange: (date) => {
            if (date) setForm((prev) => ({ ...prev, date: date.toString() }));
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
            try {
                event.preventDefault();
                if (!transaction) throw new Error('No transaction provided');
                if (!form) throw new Error('No updates provided');
                setDrawerAction({ type: 'SUBMIT' });
                const values = Object.keys(form);
                ['date', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
                    if (!values.includes(field)) throw new Error('Provide an ' + field);
                });

                const updatedTransactions = await transaction.update({
                    date: new Date(form.date!),
                    receiver: form.receiver!,
                    amount: transformBalance(form.amount?.toString() || '0'),
                    category: form.category!,
                    paymentMethod: form.paymentMethod!,
                    description: form.description as Description,
                });
                if (!updatedTransactions || updatedTransactions.length < 1) throw new Error('No transaction updated');

                const {
                    id,
                    category,
                    paymentMethod,
                    receiver,
                    description,
                    amount,
                    date,
                    created_by,
                    updated_at,
                    inserted_at,
                } = updatedTransactions[0];
                const updatedItem = new Transaction({
                    id: id,
                    categories: fetchCategories.categories.find((c) => c.id === category)!.categoryView,
                    paymentMethods: fetchPaymentMethods.paymentMethods.find((pm) => pm.id === paymentMethod)!
                        .paymentMethodView,
                    receiver: receiver,
                    description: description,
                    amount: amount,
                    date: date.toString(),
                    created_by: created_by,
                    updated_at: updated_at.toString(),
                    inserted_at: inserted_at.toString(),
                });

                if (afterSubmit) afterSubmit(updatedItem);
                await refreshTransactions();
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                handler.onClose();
                showSnackbar({
                    message: 'Transaction updated',
                });
            } catch (error) {
                console.error(error);
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        setForm(
            transaction
                ? {
                      id: transaction.id,
                      date: transaction.date.toString(),
                      receiver: transaction.receiver,
                      amount: transaction.amount,
                      category: transaction.categories.id,
                      paymentMethod: transaction.paymentMethods.id,
                      description: transaction.description,
                  }
                : null
        );
    }, [transaction]);

    if (loadingTransactions) return null;
    return (
        <FormDrawer
            open={open}
            heading="Edit Transaction"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Save"
            closeOnBackdropClick
        >
            {form && (
                <React.Fragment>
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
                        {!fetchCategories.loading && fetchCategories.categories.length > 0 ? (
                            <Autocomplete
                                id="category"
                                options={fetchCategories.categories.map((item) => ({
                                    label: item.name,
                                    value: item.id,
                                }))}
                                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                                onChange={(event, value) =>
                                    handler.autocompleteChange(event, 'category', Number(value?.value))
                                }
                                defaultValue={getCategoryFromList(Number(form.category), fetchCategories.categories)}
                                renderInput={(props) => <TextField {...props} label="Category" />}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                            />
                        ) : (
                            <CreateCategoryAlert sx={{ mb: 2 }} />
                        )}

                        {!fetchPaymentMethods.loading && fetchPaymentMethods.paymentMethods.length > 0 ? (
                            <Autocomplete
                                id="payment-method"
                                options={fetchPaymentMethods.paymentMethods.map((item) => ({
                                    label: `${item.name} • ${item.provider}`,
                                    value: item.id,
                                }))}
                                sx={{ width: { xs: '100%', md: 'calc(50% - .5rem)' }, mb: 2 }}
                                onChange={(event, value) =>
                                    handler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                                }
                                defaultValue={getPaymentMethodFromList(
                                    Number(form.paymentMethod),
                                    fetchPaymentMethods.paymentMethods
                                )}
                                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                            />
                        ) : (
                            <CreatePaymentMethodAlert sx={{ mb: 2 }} />
                        )}
                    </Box>

                    <ReceiverAutocomplete
                        sx={FormStyle}
                        id="receiver"
                        label="Receiver"
                        options={transactionReceiverSet}
                        onValueChange={handler.receiverChange}
                        defaultValue={String(form.receiver)}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel htmlFor="amount">Amount</InputLabel>
                        <OutlinedInput
                            id="amount"
                            label="Amount"
                            name="amount"
                            inputProps={{ inputMode: 'numeric' }}
                            value={form.amount}
                            onChange={handler.inputChange}
                            startAdornment={<InputAdornment position="start">€</InputAdornment>}
                        />
                    </FormControl>

                    <TextField
                        id="edit-category-description"
                        variant="outlined"
                        label="Description"
                        name="description"
                        sx={{ ...FormStyle, mb: 0 }}
                        multiline
                        rows={2}
                        value={form.description}
                        onChange={handler.inputChange}
                    />
                </React.Fragment>
            )}
        </FormDrawer>
    );
};
