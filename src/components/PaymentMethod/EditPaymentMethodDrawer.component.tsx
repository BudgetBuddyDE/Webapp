import {FormDrawer, FormDrawerReducer, generateInitialFormDrawerState} from '@/components/Drawer';
import {TextField} from '@mui/material';
import React from 'react';
import {FormStyle} from '@/style/Form.style';
import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {type TEntityDrawerState} from '@/hooks';
import {
  PocketBaseCollection,
  type TPaymentMethod,
  type TUpdatePaymentMethodPayload,
  ZPaymentMethod,
  ZUpdatePaymentMethodPayload,
} from '@budgetbuddyde/types';
import {useFetchPaymentMethods} from './useFetchPaymentMethods.hook';
import {pb} from '@/pocketbase';

export type TEditPaymentMethodDrawerPayload = TPaymentMethod;

export type TEditPaymentMethodProps = {
  onClose: () => void;
} & TEntityDrawerState<TEditPaymentMethodDrawerPayload>;

export const EditPaymentMethodDrawer: React.FC<TEditPaymentMethodProps> = ({
  shown,
  payload: drawerPayload,
  onClose,
}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {refresh: refreshPaymentMethods} = useFetchPaymentMethods();
  const [drawerState, setDrawerState] = React.useReducer(FormDrawerReducer, generateInitialFormDrawerState());
  const [form, setForm] = React.useState<Record<string, string | number | Date>>({});

  const handler = {
    onClose() {
      onClose();
      setForm({});
      setDrawerState({type: 'RESET'});
    },
    onInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    async onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!sessionUser || !drawerPayload) return;
      setDrawerState({type: 'SUBMIT'});

      try {
        const parsedForm = ZUpdatePaymentMethodPayload.safeParse({
          ...form,
          owner: sessionUser.id,
        });
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TUpdatePaymentMethodPayload = parsedForm.data;

        const record = await pb.collection(PocketBaseCollection.PAYMENT_METHOD).update(drawerPayload.id, payload);
        const parsingResult = ZPaymentMethod.safeParse(record);
        if (!parsingResult.success) throw parsingResult;

        console.debug('Updated payment-method', parsingResult.data);

        setDrawerState({type: 'SUCCESS'});
        handler.onClose();
        React.startTransition(() => {
          refreshPaymentMethods();
        });
        showSnackbar({message: `Saved applied changes for ${payload.name}`});
      } catch (error) {
        console.error(error);
        setDrawerState({type: 'ERROR', error: error as Error});
      }
    },
  };

  React.useEffect(() => {
    if (!drawerPayload) return;
    setForm({
      name: drawerPayload.name,
      address: drawerPayload.address ?? '',
      provider: drawerPayload.provider ?? '',
      description: drawerPayload.description ?? '',
    });
  }, [drawerPayload]);

  return (
    <FormDrawer
      state={drawerState}
      open={shown}
      onSubmit={handler.onFormSubmit}
      heading="Edit Payment-Method"
      onClose={handler.onClose}
      closeOnBackdropClick>
      {(['name', 'address', 'provider'] as Partial<keyof TUpdatePaymentMethodPayload>[]).map(name => {
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
      })}

      <TextField
        id="payment-method-description"
        variant="outlined"
        label="Description"
        name="description"
        sx={{...FormStyle, mb: 0}}
        multiline
        rows={3}
        onChange={handler.onInputChange}
        value={form.description}
      />
    </FormDrawer>
  );
};
