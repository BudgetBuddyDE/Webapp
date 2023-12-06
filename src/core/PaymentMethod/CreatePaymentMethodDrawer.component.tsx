import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { TextField } from '@mui/material';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import type { TCreatePaymentMethodPayload } from '@/types';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { PaymentMethodService, useFetchPaymentMethods } from '.';

export type TCreatePaymentMethodProps = {
  open: boolean;
  onChangeOpen: (isOpen: boolean) => void;
};

export const CreatePaymentMethodDrawer: React.FC<TCreatePaymentMethodProps> = ({
  open,
  onChangeOpen,
}) => {
  const { session, authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const { refresh: refreshCategories } = useFetchPaymentMethods();
  const [drawerState, setDrawerState] = React.useReducer(
    FormDrawerReducer,
    generateInitialFormDrawerState()
  );
  const [form, setForm] = React.useState<Record<string, string>>({});

  const handler = {
    onClose() {
      onChangeOpen(false);
      setForm({});
      setDrawerState({ type: 'RESET' });
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!session) return;
      setDrawerState({ type: 'SUBMIT' });

      try {
        if (!form.name) throw new Error('No name provided');
        if (!form.adress) throw new Error('No address provided');
        const payload: TCreatePaymentMethodPayload = {
          owner: session.uuid,
          name: form.name,
          address: form.address,
          provider: form.provider,
          description: form.description && form.description.length > 0 ? form.description : null,
        };

        const [createdCategory, error] = await PaymentMethodService.create(payload, authOptions);
        if (error) {
          setDrawerState({ type: 'ERROR', error: error });
          return;
        }
        if (!createdCategory) {
          setDrawerState({ type: 'ERROR', error: new Error("Couldn't create the payment-method") });
          return;
        }

        setDrawerState({ type: 'SUCCESS' });
        this.onClose();
        refreshCategories(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Created payment-method ${payload.name}` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  return (
    <FormDrawer
      state={drawerState}
      open={open}
      onSubmit={handler.onFormSubmit}
      heading="Create Payment-Method"
      onClose={handler.onClose}
      closeOnBackdropClick
    >
      <TextField
        id="payment-method-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={handler.onInputChange}
        value={form.name}
      />

      <TextField
        id="payment-method-address"
        variant="outlined"
        label="Address"
        name="address"
        sx={FormStyle}
        onChange={handler.onInputChange}
        value={form.name}
      />

      <TextField
        id="payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={handler.onInputChange}
      />
    </FormDrawer>
  );
};
