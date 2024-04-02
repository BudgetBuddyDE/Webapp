import React from 'react';
import {useNavigate} from 'react-router-dom';
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
import {useFetchPaymentMethods, CreatePaymentMethodAlert} from '@/components/PaymentMethod';
import {StyledAutocompleteOption} from '@/components/Base';
import {getNameFromLabel} from '@/components/Category';
import {PaymentMethodService} from '../PaymentMethod.service';
import {useFetchTransactions} from '@/components/Transaction';

export type TPaymentMethodInputOption = {
  label: string;
  value: number | string;
  shouldCreate?: boolean;
};

export type PaymentMethodAutocompleteProps = {
  defaultValue?: TPaymentMethodInputOption | null;
  onChange: (event: React.SyntheticEvent<Element, Event>, value: TPaymentMethodInputOption | null) => void;
  sx?: SxProps<Theme>;
  required?: boolean;
};

const filter = createFilterOptions<TPaymentMethodInputOption>();
export const PaymentMethodLabelSeperator = '•';

export function applyPaymentMethodOptionsFilter(
  options: TPaymentMethodInputOption[],
  state: FilterOptionsState<TPaymentMethodInputOption>,
): TPaymentMethodInputOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter(option => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
  if (matches.length > 0) {
    const completeMatch = matches.find(match => match.label === state.inputValue);
    return completeMatch
      ? [completeMatch]
      : [{shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1}, ...matches];
  } else return [{shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1}];
}

export const PaymentMethodAutocomplete: React.FC<PaymentMethodAutocompleteProps> = ({
  defaultValue = undefined,
  onChange,
  sx,
  required = false,
}) => {
  const id = React.useId();
  const navigate = useNavigate();
  const {loading: loadingTransactions, transactions} = useFetchTransactions();
  const {loading: loadingPaymentMethods, paymentMethods, error: paymentMethodError} = useFetchPaymentMethods();

  const options: TPaymentMethodInputOption[] = React.useMemo(() => {
    return PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(paymentMethods, transactions);
  }, [paymentMethods, transactions]);

  if (paymentMethodError) {
    console.log('PaymentMethodAutocomplete.component.tsx: paymentMethodError: ', paymentMethodError);
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        <Typography>{String(!paymentMethodError)}</Typography>
      </Alert>
    );
  }
  if (!loadingPaymentMethods && paymentMethods.length === 0) {
    return <CreatePaymentMethodAlert sx={sx} />;
  }
  return (
    <Autocomplete
      id={id + '-create-payment-method'}
      options={options}
      onChange={(event, value) => {
        if (!value) return;
        const paymentMethodExists = paymentMethods.some(
          pm => pm.name === value.label.split(PaymentMethodLabelSeperator)[0].trimEnd(),
        );
        if (paymentMethodExists) return onChange(event, value);
        const queryParams = new URLSearchParams({
          create: 'true',
          paymentMethod: getNameFromLabel(value.label),
        });
        navigate('/payment-methods?' + queryParams.toString(), {replace: true});
      }}
      filterOptions={applyPaymentMethodOptionsFilter}
      renderOption={(props, option, {selected}) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
      defaultValue={defaultValue}
      renderInput={params => (
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
          required={required}
        />
      )}
      disabled={loadingPaymentMethods || loadingTransactions}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      loading={loadingPaymentMethods || loadingTransactions}
      sx={sx}
    />
  );
};
