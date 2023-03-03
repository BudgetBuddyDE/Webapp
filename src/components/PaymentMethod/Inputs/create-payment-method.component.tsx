import { Autocomplete, SxProps, TextField, Theme } from '@mui/material';
import React from 'react';
import { useFetchPaymentMethods } from '../../../hooks';
import { CreatePaymentMethodInfo } from '../Cards';

export type PaymentMethodInputOption = {
  label: string;
  value: number | string;
};

export interface CreatePaymentMenthodInputProps {
  defaultValue?: PaymentMethodInputOption | null;
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: PaymentMethodInputOption | null) => void;
  sx?: SxProps<Theme>;
}

export const CreatePaymentMethodInput: React.FC<CreatePaymentMenthodInputProps> = ({
  defaultValue = undefined,
  onChange,
  sx,
}) => {
  const id = React.useId();
  const { loading, paymentMethods, error } = useFetchPaymentMethods();

  if (loading) {
    return null;
  }
  if (!loading && paymentMethods.length < 1) return <CreatePaymentMethodInfo sx={sx} />;
  if (!loading && paymentMethods.length === 0 && error) {
    return null;
  }
  if (!loading && error) console.error('CreatePaymentMethodInput: ' + error);
  return (
    <Autocomplete
      id={id + '-create-payment-method'}
      options={paymentMethods.map((item) => ({
        label: `${item.name} • ${item.provider}`,
        value: item.id,
      }))}
      onChange={onChange}
      defaultValue={defaultValue}
      renderInput={(props) => <TextField {...props} label="Payment Method" />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      sx={sx}
    />
  );
};
