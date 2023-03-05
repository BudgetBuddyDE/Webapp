import { Alert, TextField } from '@mui/material';
import React from 'react';
import { AuthContext, SnackbarContext, StoreContext } from '../../context';
import { PaymentMethodService } from '../../services';
import { FormStyle } from '../../theme/form-style';
import type { IBasePaymentMethod, IPaymentMethod } from '../../types';
import { FormDrawer } from '../Base';

export interface ICreatePaymentMethodProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (paymentMethod: IPaymentMethod) => void;
}

export const CreatePaymentMethod: React.FC<ICreatePaymentMethodProps> = ({ open, setOpen, afterSubmit }) => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setPaymentMethods } = React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBasePaymentMethod>>({});
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
      setForm({});
    },
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(form);
        ['name', 'address', 'provider'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const createdPaymentMethods = await PaymentMethodService.createPaymentMethods([form]);
        if (createdPaymentMethods.length < 1) throw new Error('No payment-methods created');

        const createdPaymentMethod = createdPaymentMethods[0];
        if (afterSubmit) afterSubmit(createdPaymentMethod);
        startTransition(() => {
          setPaymentMethods({ type: 'ADD_ITEM', entry: createdPaymentMethod });
        });
        handler.onClose();
        showSnackbar({
          message: 'Payment Method added',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Add Payment Method"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      saveLabel="Create"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        id="payment-method-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
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
