import {type TPaymentMethod} from '@budgetbuddyde/types';
import {
  Autocomplete,
  type AutocompleteChangeReason,
  type FilterOptionsState,
  TextField,
  type TextFieldProps,
  createFilterOptions,
} from '@mui/material';
import React from 'react';

import {StyledAutocompleteOption} from '@/components/Base';
import {PaymentMethodService, useFetchPaymentMethods} from '@/components/PaymentMethod';
import {useFetchTransactions} from '@/components/Transaction';

export type TPaymentMethodAutocompleteOption = {
  label: TPaymentMethod['name'];
  id: TPaymentMethod['id'];
};

export type TPaymentMethodAutocompleteProps = {
  value?: TPaymentMethodAutocompleteOption | TPaymentMethodAutocompleteOption[] | null;
  defaultValue?: TPaymentMethodAutocompleteOption | TPaymentMethodAutocompleteOption[] | null;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: TPaymentMethodAutocompleteOption | TPaymentMethodAutocompleteOption[] | null,
    reason: AutocompleteChangeReason,
  ) => void;
  textFieldProps?: TextFieldProps;
  multiple?: boolean;
};

const filter = createFilterOptions<TPaymentMethodAutocompleteOption>();

/**
 * Applies a filter to the category options.
 *
 * @param options The category options to filter.
 */
export function applyPaymentMethodOptionsFilter(
  options: TPaymentMethodAutocompleteOption[],
  state: FilterOptionsState<TPaymentMethodAutocompleteOption>,
): TPaymentMethodAutocompleteOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter(option => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
  return matches;
}

export const PaymentMethodAutocomplete: React.FC<TPaymentMethodAutocompleteProps> = ({
  value,
  defaultValue,
  onChange,
  textFieldProps,
  multiple = false,
}) => {
  const {loading: loadingTransactions, transactions} = useFetchTransactions();
  const {loading: loadingPaymentMethods, paymentMethods} = useFetchPaymentMethods();

  const options: TPaymentMethodAutocompleteOption[] = React.useMemo(() => {
    return PaymentMethodService.sortAutocompleteOptionsByTransactionUsage(paymentMethods, transactions);
  }, [transactions, paymentMethods]);

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      getOptionLabel={option => {
        if (typeof option === 'string') return option;
        return option.label;
      }}
      value={value}
      onChange={onChange}
      filterOptions={applyPaymentMethodOptionsFilter}
      isOptionEqualToValue={(option, value) => option.id === value?.id || typeof value === 'string'}
      defaultValue={defaultValue}
      loadingText="Loading..."
      loading={loadingPaymentMethods || loadingTransactions}
      selectOnFocus
      autoHighlight
      disableCloseOnSelect={multiple}
      renderInput={params => <TextField label="Payment Method" {...textFieldProps} {...params} />}
      renderOption={(props, option, {selected}) => (
        <StyledAutocompleteOption {...props} key={option.id} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
    />
  );
};
