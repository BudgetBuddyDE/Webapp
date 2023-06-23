import React from 'react';
import { FormDrawer } from '@/components/Base';
import { SnackbarContext, StoreContext } from '@/context';
import { Budget } from '@/models';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer';
import { IBaseBudget } from '@/types';
import { sleep, transformBalance } from '@/utils';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';

export interface IEditBudgetProps {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (budget: Budget) => void;
    budget: Budget | null;
}

interface EditBudgetHandler {
    onClose: () => void;
    autocompleteChange: (
        event: React.SyntheticEvent<Element, Event>,
        key: 'category' | 'paymentMethod',
        value: string | number
    ) => void;
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const EditBudget: React.FC<IEditBudgetProps> = ({ open, setOpen, afterSubmit, budget }) => {
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { loading, setBudget } = React.useContext(StoreContext);
    const [form, setForm] = React.useState<Partial<IBaseBudget> | null>(null);
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler: EditBudgetHandler = {
        onClose: () => {
            setOpen(false);
            setForm(null);
        },
        autocompleteChange: (event, value) => {
            setForm((prev) => ({ ...prev, category: Number(value) }));
        },
        inputChange: (event) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        onSubmit: async (event) => {
            try {
                event.preventDefault();
                if (!budget) throw new Error('No budget provided');
                if (!form) throw new Error('No changes provided');
                setDrawerAction({ type: 'SUBMIT' });
                const values = Object.keys(form);
                ['budget'].forEach((field) => {
                    if (!values.includes(field)) throw new Error('Provide an ' + field);
                });

                const updatedBudgets = await budget.update({
                    budget: transformBalance(form.budget!.toString()),
                });
                if (!updatedBudgets || updatedBudgets.length < 1) throw new Error('No budget updated');

                const updatedBaseBudget = updatedBudgets[0];
                const updatedBudget = budget;
                updatedBudget.budget = updatedBaseBudget.budget;
                if (afterSubmit) afterSubmit(updatedBudget);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                setBudget({ type: 'UPDATE_BY_ID', entry: updatedBudget });
                handler.onClose();
                showSnackbar({ message: `Budget for category '${updatedBudget.category.name}' saved` });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        setForm(budget ? { budget: budget.budget } : null);
    }, [budget]);

    if (loading) return null;
    return (
        <FormDrawer
            open={open}
            heading="Edit Budget"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Create"
            closeOnBackdropClick
        >
            {form && (
                <React.Fragment>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel htmlFor="edit-budget">Monthly Budget</InputLabel>
                        <OutlinedInput
                            id="edit-budget"
                            label="Monthly Budget"
                            name="budget"
                            inputProps={{ inputMode: 'numeric' }}
                            value={form.budget}
                            onChange={handler.inputChange}
                            startAdornment={<InputAdornment position="start">€</InputAdornment>}
                        />
                    </FormControl>
                </React.Fragment>
            )}
        </FormDrawer>
    );
};
