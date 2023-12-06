import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  CircularProgress,
  type FilterOptionsState,
  type SxProps,
  TextField,
  type Theme,
  Typography,
  createFilterOptions,
} from '@mui/material';
import { useFetchPaymentMethods } from '../useFetchPaymentMethods.hook';
import { CreatePaymentMethodAlert } from '../CreatePaymentMethodAlert.component';
import { StyledAutocompleteOption } from '@/components/Base';

export type TPaymentMethodInputOption = {
  label: string;
  value: number | string;
  shouldCreate?: boolean;
};

export type PaymentMethodAutocompleteProps = {
  defaultValue?: TPaymentMethodInputOption | null;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: TPaymentMethodInputOption | null
  ) => void;
  sx?: SxProps<Theme>;
};

const filter = createFilterOptions<TPaymentMethodInputOption>();
export const PaymentMethodLabelSeperator = '•';

export function applyPaymentMethodOptionsFilter(
  options: TPaymentMethodInputOption[],
  state: FilterOptionsState<TPaymentMethodInputOption>
): TPaymentMethodInputOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter((option) =>
    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
  );
  if (matches.length > 0) {
    const completeMatch = matches.find((match) => match.label === state.inputValue);
    return completeMatch
      ? [completeMatch]
      : [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }, ...matches];
  } else return [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }];
}

export const PaymentMethodAutocomplete: React.FC<PaymentMethodAutocompleteProps> = ({
  defaultValue = undefined,
  onChange,
  sx,
}) => {
  const id = React.useId();
  const navigate = useNavigate();
  const { loading: loadingPaymentMethods, paymentMethods, error } = useFetchPaymentMethods();

  if (!loadingPaymentMethods && paymentMethods.length === 0 && !error) {
    if (error) {
      return (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          <Typography>{String(error)}</Typography>
        </Alert>
      );
    } else return <CreatePaymentMethodAlert sx={sx} />;
  } else if (!loadingPaymentMethods && error) console.error('PaymentMethodAutocomplete: ' + error);
  return (
    <Autocomplete
      id={id + '-create-payment-method'}
      options={paymentMethods.map((item) => ({
        label: `${item.name} ${PaymentMethodLabelSeperator} ${item.provider}`,
        value: item.id,
      }))}
      onChange={(event, value) => {
        if (!value) return;
        const paymentMethodExists = paymentMethods.some(
          (pm) => pm.name === value.label.split(PaymentMethodLabelSeperator)[0].trimEnd()
        );
        if (paymentMethodExists) return onChange(event, value);
        navigate('/payment-methods', {
          state: { create: true, paymentMethod: { name: value.label.split('"')[1] } },
        });
      }}
      filterOptions={applyPaymentMethodOptionsFilter}
      renderOption={(props, option, { selected }) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
      defaultValue={defaultValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Payment Method"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loadingPaymentMethods && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      disabled={loadingPaymentMethods}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      loading={loadingPaymentMethods}
      sx={sx}
    />
  );
};
