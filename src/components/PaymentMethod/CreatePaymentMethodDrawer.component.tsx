import { FormDrawer, FormDrawerReducer, generateInitialFormDrawerState } from '@/components/Drawer';
import { TextField } from '@mui/material';
import React from 'react';
import { FormStyle } from '@/style/Form.style';
import {
  ZCreatePaymentMethodPayload,
  type TCreatePaymentMethodPayload,
} from '@budgetbuddyde/types';
import { useAuthContext } from '../Auth';
import { useSnackbarContext } from '../Snackbar';
import { PaymentMethodService } from './PaymentMethod.service';
import { useFetchPaymentMethods } from './useFetchPaymentMethods.hook';
import { type TEntityDrawerState } from '@/hooks';

export type TCreatePaymentMethodDrawerPayload = Omit<TCreatePaymentMethodPayload, 'owner'>;

export type TCreatePaymentMethodProps = {
  onClose: () => void;
} & TEntityDrawerState<TCreatePaymentMethodDrawerPayload>;

export const CreatePaymentMethodDrawer: React.FC<TCreatePaymentMethodProps> = ({
  shown,
  payload,
  onClose,
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
      onClose();
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
        const parsedForm = ZCreatePaymentMethodPayload.safeParse({
          ...form,
          owner: session.uuid,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TCreatePaymentMethodPayload = parsedForm.data;

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
        handler.onClose();
        refreshCategories(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Created payment-method ${payload.name}` });
      } catch (error) {
        console.error(error);
        setDrawerState({ type: 'ERROR', error: error as Error });
      }
    },
  };

  React.useLayoutEffect(() => {
    if (!payload) return;
    setForm({
      name: payload.name,
      address: payload.address ?? '',
      provider: payload.provider ?? '',
      description: payload.description ?? '',
    });
    return () => {
      setForm({});
    };
  }, [payload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Create Payment-Method"
      onClose={handler.onClose}
      closeOnBackdropClick
    >
      {(['name', 'address', 'provider'] as Partial<keyof TCreatePaymentMethodPayload>[]).map(
        (name) => {
          return (
            <TextField
              key={'payment-method-' + name}
              id={'payment-method-' + name}
              variant="outlined"
              label={name.charAt(0).toUpperCase() + name.slice(1)}
              name={name}
              sx={FormStyle}
              onChange={handler.onInputChange}
              value={form[name]}
              required
            />
          );
        }
      )}

      <TextField
        id="payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{ ...FormStyle, mb: 0 }}
        multiline
        rows={3}
        onChange={handler.onInputChange}
        value={form.description ?? ''}
      />
    </FormDrawer>
  );
};
