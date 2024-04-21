import React from 'react';
import {
  Autocomplete,
  AutocompleteChangeReason,
  FilterOptionsState,
  TextField,
  createFilterOptions,
  type TextFieldProps,
} from '@mui/material';
import {useFetchTransactions} from '@/components/Transaction';
import {StyledAutocompleteOption} from '@/components/Base';

export type TReceiverAutocompleteOption = {
  label: string;
  value: string;
};

export interface IReceiverAutocompleteProps {
  value?: TReceiverAutocompleteOption | null;
  defaultValue?: TReceiverAutocompleteOption | null;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: TReceiverAutocompleteOption | null,
    reason: AutocompleteChangeReason,
  ) => void;
  textFieldProps?: TextFieldProps;
}

const filter = createFilterOptions<TReceiverAutocompleteOption>();

export function applyReceiverOptionsFilter(
  options: TReceiverAutocompleteOption[],
  state: FilterOptionsState<TReceiverAutocompleteOption>,
): TReceiverAutocompleteOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter(option => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
  if (matches.length > 0) {
    const completeMatch = matches.find(match => match.label === state.inputValue);
    return completeMatch
      ? [completeMatch]
      : [{label: `Create "${state.inputValue}"`, value: state.inputValue}, ...matches];
  } else return [{label: `Create "${state.inputValue}"`, value: state.inputValue}];
}

export const ReceiverAutocomplete: React.FC<IReceiverAutocompleteProps> = ({
  value,
  defaultValue,
  onChange,
  textFieldProps,
}) => {
  const {loading, transactions} = useFetchTransactions();

  const options: TReceiverAutocompleteOption[] = React.useMemo(() => {
    return Array.from(new Set(transactions.map(({receiver}) => receiver))).map(
      receiver => ({label: receiver, value: receiver}) as TReceiverAutocompleteOption,
    );
  }, [transactions]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => {
        if (typeof option === 'string') return option;
        if (option.value) return option.value;
        return option.label;
      }}
      value={value}
      onChange={onChange}
      filterOptions={applyReceiverOptionsFilter}
      // FIXME:
      isOptionEqualToValue={(option, value) => option.value === value?.value || typeof value.value === 'string'}
      defaultValue={defaultValue}
      loadingText="Loading..."
      loading={loading}
      selectOnFocus
      autoHighlight
      renderInput={params => <TextField label="Receiver" {...textFieldProps} {...params} />}
      renderOption={(props, option, {selected}) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
    />
  );
};
