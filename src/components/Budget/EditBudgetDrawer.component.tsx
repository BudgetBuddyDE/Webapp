import React from 'react';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchBudget } from '@/hook/useFetchBudget.hook';
import { BaseBudget } from '@/models/BaseBudget.model';
import { Budget } from '@/models/Budget.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import type { BaseBudget as TBaseBudget } from '@/type/budget.type';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';

export type EditBudgetDrawerProps = {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (budget: BaseBudget[]) => void;
    budget: Budget | null;
};

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

export const EditBudgetDrawer: React.FC<EditBudgetDrawerProps> = ({ open, setOpen, afterSubmit, budget }) => {
    const { loading: loadingBudget, refresh: refreshBudget } = useFetchBudget();
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());
    const [form, setForm] = React.useState<Partial<TBaseBudget> | null>(null);

    const handler: EditBudgetHandler = {
        onClose: () => {
            setOpen(false);
            setForm(null);
        },
        autocompleteChange: (_event, value) => {
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
                if (afterSubmit) afterSubmit(updatedBudgets);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                await refreshBudget();
                handler.onClose();
                showSnackbar({ message: `Budget for category saved` });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        setForm(budget ? { budget: budget.budget } : null);
    }, [budget]);

    if (loadingBudget) return null;
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
