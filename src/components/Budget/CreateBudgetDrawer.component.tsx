import React from 'react';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { useFetchBudget } from '@/hook/useFetchBudget.hook';
import { BaseBudget } from '@/models/BaseBudget.model';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer/DrawerAction.reducer';
import { BudgetService } from '@/services/Budget.service';
import type { BaseBudget as TBaseBudget } from '@/type/budget.type';
import { sleep } from '@/util/sleep.util';
import { transformBalance } from '@/util/transformBalance.util';
import { FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { CategoryAutocomplete } from '../Category/CategoryAutocomplete.component';
import { FormDrawer } from '../Core/Drawer/FormDrawer.component';

export type CreateBudgetDrawerProps = {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (budget: BaseBudget[]) => void;
};

interface CreateBudgetDrawerHandler {
    onClose: () => void;
    autocompleteChange: (event: React.SyntheticEvent<Element, Event>, value: string | number) => void;
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateBudgetDrawer: React.FC<CreateBudgetDrawerProps> = ({ open, setOpen, afterSubmit }) => {
    const { loading: loadingBudget, fetched: budgetFetched, budget, refresh: refreshBudget } = useFetchBudget();
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [form, setForm] = React.useState<Partial<TBaseBudget>>({});
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler: CreateBudgetDrawerHandler = {
        onClose: () => {
            setOpen(false);
            setForm({});
            setDrawerAction({ type: 'RESET' });
        },
        autocompleteChange: (_event, value) => {
            setForm((prev) => ({ ...prev, category: Number(value) }));
        },
        inputChange: (event) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        onSubmit: async (event) => {
            event.preventDefault();
            setDrawerAction({ type: 'SUBMIT' });
            const values = Object.keys(form);
            const missingValues = ['category', 'budget'].filter((value) => !values.includes(value));
            try {
                if (missingValues.length > 0) {
                    throw new Error('Provide an ' + missingValues.join(', ') + '!');
                }

                if (!budgetFetched || (budgetFetched && !budget)) {
                    throw new Error('Something went wrong when retrieving our budget from the database');
                }

                // Check if the user has already set an budget for this category
                if (budget.some((budget) => budget.category.id === form.category)) {
                    throw new Error("You've already set an Budget for this category");
                }
                const createdBudgets = await BudgetService.create([
                    {
                        category: Number(form.category),
                        budget: transformBalance(form.budget!.toString()),
                        created_by: session!.user!.id,
                    },
                ]);
                if (createdBudgets.length < 1) throw new Error('No budget saved');
                if (afterSubmit) afterSubmit(createdBudgets);
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

    if (loadingBudget) return null;
    return (
        <FormDrawer
            open={open}
            heading="Set Budget"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Create"
            closeOnBackdropClick
        >
            <CategoryAutocomplete
                onChange={(_event, value) => {
                    if (value?.value) {
                        setForm((prev) => ({ ...prev, category: Number(value.value) }));
                    }
                }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel htmlFor="add-budget">Monthly Budget</InputLabel>
                <OutlinedInput
                    id="add-budget"
                    label="Monthly Budget"
                    name="budget"
                    inputProps={{ inputMode: 'numeric' }}
                    onChange={handler.inputChange}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                />
            </FormControl>
        </FormDrawer>
    );
};
