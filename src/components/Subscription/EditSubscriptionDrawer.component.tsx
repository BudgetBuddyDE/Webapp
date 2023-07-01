import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
import { useFetchPaymentMethods } from '@/hook/useFetchPaymentMethods.hook';
import { useFetchSubscriptions } from '@/hook/useFetchSubscriptions.hook';
import { useScreenSize } from '@/hook/useScreenSize.hook';
import { Subscription } from '@/models/Subscription.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { FormStyle } from '@/style/Form.style';
import type { TBaseSubscription } from '@/type/subscription.type';
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

export type EditSubscriptionDrawerProps = {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (subscription: Subscription) => void;
    subscription: Subscription | null;
};

interface EditSubscriptionHandler {
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

export const EditSubscriptionDrawer: React.FC<EditSubscriptionDrawerProps> = ({
    open,
    setOpen,
    afterSubmit,
    subscription,
}) => {
    const screenSize = useScreenSize();
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { transactionReceiverSet } = React.useContext(StoreContext);
    const { loading: loadingSubscriptions, refresh: refreshSubscriptions } = useFetchSubscriptions();
    const fetchCategories = useFetchCategories();
    const fetchPaymentMethods = useFetchPaymentMethods();
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());
    const [executionDate, setExecutionDate] = React.useState(new Date());
    const [form, setForm] = React.useState<Partial<TBaseSubscription> | null>(null);

    const handler: EditSubscriptionHandler = {
        onClose: () => {
            setOpen(false);
            setForm({});
            setExecutionDate(new Date());
        },
        onDateChange: (date) => {
            if (date) setExecutionDate(date);
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
                if (!subscription) throw new Error('No subscription provided');
                if (!form) throw new Error('No updates provided');
                setDrawerAction({ type: 'SUBMIT' });
                const values = Object.keys(form);
                ['id', 'category', 'paymentMethod', 'receiver', 'amount'].forEach((field) => {
                    if (!values.includes(field)) throw new Error('Provide an ' + field);
                });

                const updatedSubscriptions = await subscription.update({
                    execute_at: executionDate.getDate(),
                    receiver: form.receiver!,
                    category: form.category!,
                    paymentMethod: form.paymentMethod!,
                    amount: transformBalance(String(form.amount!)),
                    description:
                        typeof form.description === 'string' && form.description.length > 0 ? form.description : null,
                });
                if (!updatedSubscriptions || updatedSubscriptions.length < 1)
                    throw new Error('No subscription updated');

                const {
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
                } = updatedSubscriptions[0];
                const updatedItem = new Subscription({
                    id: id,
                    categories: fetchCategories.categories.find((c) => c.id === category)!.categoryView,
                    paymentMethods: fetchPaymentMethods.paymentMethods.find((pm) => pm.id === paymentMethod)!
                        .paymentMethodView,
                    receiver: receiver,
                    description: description,
                    amount: amount,
                    execute_at: execute_at,
                    created_by: created_by,
                    updated_at: updated_at.toString(),
                    inserted_at: inserted_at.toString(),
                });

                if (afterSubmit) afterSubmit(updatedItem);
                await refreshSubscriptions();
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                handler.onClose();
                showSnackbar({ message: 'Subscription updated' });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        if (subscription) {
            const executeAt = new Date();
            executeAt.setDate(subscription.execute_at);
            setExecutionDate(executeAt);
            setForm({
                id: subscription.id,
                receiver: subscription.receiver,
                amount: subscription.amount,
                category: subscription.categories.id,
                paymentMethod: subscription.paymentMethods.id,
                description: subscription.description ?? '',
            });
        } else setForm(null);
    }, [subscription]);

    if (loadingSubscriptions) return null;
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
                                label="Execute at"
                                inputFormat="dd"
                                value={executionDate}
                                onChange={handler.onDateChange}
                                renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                            />
                        ) : (
                            <DesktopDatePicker
                                label="Execute at"
                                inputFormat="dd"
                                value={executionDate}
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
