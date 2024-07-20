import {type TCategory} from '@budgetbuddyde/types';
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
import {CategoryService, useFetchCategories} from '@/components/Category';
import {useFetchTransactions} from '@/components/Transaction';

export type TCategoryAutocompleteOption = {
  label: TCategory['name'];
  id: TCategory['id'];
};

export type TCategoryAutocompleteProps = {
  value?: TCategoryAutocompleteOption | TCategoryAutocompleteOption[] | null;
  defaultValue?: TCategoryAutocompleteOption | TCategoryAutocompleteOption[] | null;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: TCategoryAutocompleteOption | TCategoryAutocompleteOption[] | null,
    reason: AutocompleteChangeReason,
  ) => void;
  textFieldProps?: TextFieldProps;
  multiple?: boolean;
};

const filter = createFilterOptions<TCategoryAutocompleteOption>();

/**
 * Applies a filter to the category options.
 *
 * @param options The category options to filter.
 */
export function applyCategoryOptionsFilter(
  options: TCategoryAutocompleteOption[],
  state: FilterOptionsState<TCategoryAutocompleteOption>,
): TCategoryAutocompleteOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter(option => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
  return matches;
}

export const CategoryAutocomplete: React.FC<TCategoryAutocompleteProps> = ({
  value,
  defaultValue,
  onChange,
  textFieldProps,
  multiple,
}) => {
  const {loading: loadingTransactions, transactions} = useFetchTransactions();
  const {loading: loadingCategories, categories} = useFetchCategories();

  const options: TCategoryAutocompleteOption[] = React.useMemo(() => {
    return CategoryService.sortAutocompleteOptionsByTransactionUsage(categories, transactions);
  }, [transactions, categories]);

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
      filterOptions={applyCategoryOptionsFilter}
      isOptionEqualToValue={(option, value) => option.id === value?.id || typeof value === 'string'}
      defaultValue={defaultValue}
      loadingText="Loading..."
      loading={loadingCategories || loadingTransactions}
      selectOnFocus
      autoHighlight
      disableCloseOnSelect={multiple}
      renderInput={params => <TextField label="Category" {...textFieldProps} {...params} />}
      renderOption={(props, option, {selected}) => (
        <StyledAutocompleteOption {...props} key={option.id} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
    />
  );
};
