import React from 'react';
import { FormDrawer } from '@/components/Base';
import { AuthContext, SnackbarContext, StoreContext } from '@/context';
import { useFetchCategories } from '@/hooks';
import { Category } from '@/models';
import { DrawerActionReducer, generateInitialDrawerActionState } from '@/reducer';
import { CategoryService } from '@/services';
import { FormStyle } from '@/theme/form-style';
import type { IBaseCategory, IEditCategory } from '@/types';
import { sleep } from '@/utils';
import { TextField } from '@mui/material';

export interface ICreateCategoryProps {
    open: boolean;
    setOpen: (show: boolean) => void;
    afterSubmit?: (category: Category) => void;
    category?: Partial<IEditCategory> | null;
}

interface CreateCategoryHandler {
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CreateCategory: React.FC<ICreateCategoryProps> = ({ open, setOpen, afterSubmit, category }) => {
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { loading } = React.useContext(StoreContext);
    const { refresh } = useFetchCategories();
    const [form, setForm] = React.useState<Partial<IBaseCategory>>({});
    const [drawerAction, setDrawerAction] = React.useReducer(DrawerActionReducer, generateInitialDrawerActionState());

    const handler: CreateCategoryHandler = {
        onClose: () => {
            setOpen(false);
            setForm({});
            setDrawerAction({ type: 'RESET' });
        },
        onSubmit: async (event) => {
            event.preventDefault();
            setDrawerAction({ type: 'SUBMIT' });
            try {
                if (!form.name) throw new Error('No name provided');

                const createdCategories = await CategoryService.createCategories([
                    {
                        name: form.name,
                        description: form.description,
                        created_by: session!.user!.id,
                    },
                ]);
                if (createdCategories.length < 0) throw new Error('No category created');

                const createdCategory = createdCategories[0];
                if (afterSubmit) afterSubmit(createdCategory);
                setDrawerAction({ type: 'SUCCESS' });
                await sleep(300);
                refresh();
                handler.onClose();
                showSnackbar({ message: 'Category updated' });
            } catch (error) {
                console.error(error);
                setDrawerAction({ type: 'ERROR', error: error as Error });
            }
        },
    };

    React.useEffect(() => {
        if (!category) return;
        setForm({ name: category.name });
    }, [category]);

    if (loading) return null;
    return (
        <FormDrawer
            open={open}
            heading="Add Category"
            onClose={handler.onClose}
            onSubmit={handler.onSubmit}
            drawerActionState={drawerAction}
            saveLabel="Create"
            closeOnBackdropClick
        >
            <TextField
                id="category-name"
                variant="outlined"
                label="Name"
                name="name"
                sx={FormStyle}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                value={form.name}
            />

            <TextField
                id="category-description"
                variant="outlined"
                label="Description"
                name="description"
                sx={{ ...FormStyle, mb: 0 }}
                multiline
                rows={3}
                onChange={(event) => {
                    const value = event.target.value;
                    const description = value.length > 0 ? value : null;
                    setForm((prev) => ({ ...prev, description: description }));
                }}
            />
        </FormDrawer>
    );
};
