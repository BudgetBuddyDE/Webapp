import { Alert, TextField } from '@mui/material';
import * as React from 'react';
import { AuthContext } from '../../context/auth.context';
import { SnackbarContext } from '../../context/snackbar.context';
import { StoreContext } from '../../context/store.context';
import { PaymentMethod } from '../../models/paymentMethod.model';
import { FormStyle } from '../../theme/form-style';
import type { IBasePaymentMethod } from '../../types/paymentMethod.type';
import { FormDrawer } from '../form-drawer.component';

export interface IEditPaymentMethodProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (paymentMethod: PaymentMethod) => void;
  paymentMethod: PaymentMethod | null;
}

export const EditPaymentMethod: React.FC<IEditPaymentMethodProps> = ({
  open,
  setOpen,
  afterSubmit,
  paymentMethod,
}) => {
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setPaymentMethods } = React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [form, setForm] = React.useState<Partial<IBasePaymentMethod> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handler = {
    onClose: () => {
      setOpen(false);
    },
    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        if (!paymentMethod) throw new Error('No payment-method provided');
        if (!form) throw new Error('No updates provided');
        const values = Object.keys(form);
        ['id', 'name', 'address', 'provider'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        // @ts-expect-error will work because we're checking if the object contains all required keys at the top
        const updatedPaymentMethods = await paymentMethod.update(form);
        if (!updatedPaymentMethods || updatedPaymentMethods.length < 1)
          throw new Error('No payment-method updated');

        const updatedItem = updatedPaymentMethods[0];
        if (afterSubmit) afterSubmit(updatedItem);
        startTransition(() => {
          setPaymentMethods((prev) => {
            return prev.map((item) => {
              if (item.id === updatedItem.id) {
                item.name = updatedItem.name;
                item.address = updatedItem.address;
                item.provider = updatedItem.provider;
                item.description = updatedItem.description;
                return item;
              }
              return item;
            });
          });
        });
        handler.onClose();
        showSnackbar({
          message: 'Payment method updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  React.useEffect(() => {
    setForm(
      paymentMethod
        ? {
            id: paymentMethod.id,
            name: paymentMethod.name,
            address: paymentMethod.address,
            provider: paymentMethod.provider,
            description: paymentMethod.description,
          }
        : null
    );
  }, [paymentMethod]);

  if (loading) return null;
  return (
    <FormDrawer
      open={open}
      heading="Edit Payment Method"
      onClose={handler.onClose}
      onSubmit={handler.onSubmit}
      saveLabel="Save"
      closeOnBackdropClick
    >
      {errorMessage.length > 1 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        id="edit-payment-method-name"
        variant="outlined"
        label="Name"
        name="name"
        sx={FormStyle}
        value={form ? form.name : ''}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />

      <TextField
        id="edit-payment-method-provider"
        variant="outlined"
        label="Provider"
        name="provider"
        sx={FormStyle}
        value={form ? form.provider : ''}
        onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))}
      />

      <TextField
        id="edit-payment-method-address"
        variant="outlined"
        label="Address"
        name="address"
        sx={FormStyle}
        value={form ? form.address : ''}
        onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
      />

      <TextField
        id="edit-payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        value={form ? form.description ?? '' : ''}
        onChange={(event) => {
          const value = event.target.value;
          const description = value.length > 0 ? value : null;
          setForm((prev) => ({ ...prev, description: description }));
        }}
      />
    </FormDrawer>
  );
};
