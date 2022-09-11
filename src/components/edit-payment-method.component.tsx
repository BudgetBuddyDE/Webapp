import { ChangeEvent, FC, FormEvent, useContext, useEffect, useState } from 'react';
import { Alert, TextField } from '@mui/material';
import { StoreContext } from '../context/store.context';
import { FormDrawer } from './form-drawer.component';
import type { IPaymentMethod } from '../types/transaction.interface';
import { SnackbarContext } from '../context/snackbar.context';
import { AuthContext } from '../context/auth.context';
import { FormStyle } from '../theme/form-style';
import { PaymentMethodService } from '../services/payment-method.service';

export interface IEditPaymentMethodProps {
  open: boolean;
  setOpen: (show: boolean) => void;
  afterSubmit?: (paymentMethod: IPaymentMethod) => void;
  paymentMethod: IPaymentMethod | null;
}

export const EditPaymentMethod: FC<IEditPaymentMethodProps> = ({
  open,
  setOpen,
  afterSubmit,
  paymentMethod,
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
        ['id', 'name', 'address', 'provider'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const update = {
          name: form.name,
          address: form.address,
          provider: form.provider,
          description: form.description || null,
          created_by: session!.user!.id,
        };

        const data = await PaymentMethodService.updatePaymentMethod(
          Number(form.id),
          update as Partial<IPaymentMethod>
        );
        if (data === null) throw new Error('No payment-method updated');

        const updatedItem = data[0];
        if (afterSubmit) afterSubmit(updatedItem);
        setPaymentMethods((prev) =>
          prev.map((paymentMethod) => {
            if (paymentMethod.id === updatedItem.id) {
              return {
                ...paymentMethod,
                name: updatedItem.name.toString(),
                address: updatedItem.address.toString(),
                provider: updatedItem.provider.toString(),
                description: updatedItem.description ? updatedItem.description.toString() : null,
              };
            }
            return paymentMethod;
          })
        );
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

  useEffect(() => {
    if (paymentMethod) {
      setForm({
        id: paymentMethod.id,
        name: paymentMethod.name,
        address: paymentMethod.address,
        provider: paymentMethod.provider,
        description: paymentMethod.description || '',
      });
    } else setForm({});
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
        value={form.name}
        onChange={handler.inputChange}
      />

      <TextField
        id="edit-payment-method-provider"
        variant="outlined"
        label="Provider"
        name="provider"
        sx={FormStyle}
        value={form.provider}
        onChange={handler.inputChange}
      />

      <TextField
        id="edit-payment-method-address"
        variant="outlined"
        label="Address"
        name="address"
        sx={FormStyle}
        value={form.address}
        onChange={handler.inputChange}
      />

      <TextField
        id="edit-payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        value={form.description}
        onChange={handler.inputChange}
      />
    </FormDrawer>
  );
};
