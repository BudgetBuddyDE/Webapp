import { ChangeEvent, FC, FormEvent, useContext, useState } from 'react';
import { Alert, TextField } from '@mui/material';
import { StoreContext } from '../context/store.context';
import { FormDrawer } from './form-drawer.component';
import type { IPaymentMethod } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { PaymentMethodService } from '../services/payment-method.service';

export interface ICreatePaymentMethodProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (paymentMethod: IPaymentMethod) => void;
}

export const CreatePaymentMethod: FC<ICreatePaymentMethodProps> = ({
  open,
  setOpen,
  afterSubmit,
}) => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, setPaymentMethods } = useContext(StoreContext);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(form);
        ['name', 'address', 'provider'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const data = await PaymentMethodService.createPaymentMethods([
          {
            name: form.name,
            address: form.address,
            provider: form.provider,
            description: form.description || null,
            created_by: session!.user!.id,
          } as IPaymentMethod,
        ]);
        if (data === null) throw new Error('No payment-method created');

        if (afterSubmit) afterSubmit(data[0]);
        setPaymentMethods((prev) => [...prev, ...data]);
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
        onChange={handler.inputChange}
      />

      <TextField
        id="payment-method-provider"
        variant="outlined"
        label="Provider"
        name="provider"
        sx={FormStyle}
        onChange={handler.inputChange}
      />

      <TextField
        id="payment-method-address"
        variant="outlined"
        label="Address"
        name="address"
        sx={FormStyle}
        onChange={handler.inputChange}
      />

      <TextField
        id="payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
