import {type TStockExchange} from '@budgetbuddyde/types';
import {
  Autocomplete,
  type AutocompleteChangeReason,
  Box,
  FilterOptionsState,
  TextField,
  type TextFieldProps,
  Typography,
  createFilterOptions,
} from '@mui/material';

import {StyledAutocompleteOption} from '@/components/Base';

import {useFetchStockExchanges} from './useFetchStockExchanges.hook';

export type TStockExchangeAutocompleteOption = {
  value: TStockExchange['id'];
  label: TStockExchange['name'];
  ticker: TStockExchange['symbol'];
};

export interface IStockExchangeAutocompleteProps {
  value?: TStockExchangeAutocompleteOption | null;
  defaultValue?: TStockExchangeAutocompleteOption | null;
  onChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: TStockExchangeAutocompleteOption | null,
    reason: AutocompleteChangeReason,
  ) => void;
  textFieldProps?: TextFieldProps;
}

/**
 * The filter function used for creating options in the stock exchange autocomplete component.
 * @typeParam T - The type of the options.
 * @param option - The option to filter.
 * @returns Whether the option should be included in the filtered list.
 */
const filter = createFilterOptions<TStockExchangeAutocompleteOption>({
  stringify: option => option.label + option.ticker,
});

/**
 * Applies a filter to the stock exchange options based on the provided state.
 *
 * @param options - The array of stock exchange options to filter.
 * @param state - The filter options state to apply.
 * @returns The filtered array of stock exchange options.
 */
export function applyStockExchangeOptionsFilter(
  options: TStockExchangeAutocompleteOption[],
  state: FilterOptionsState<TStockExchangeAutocompleteOption>,
): TStockExchangeAutocompleteOption[] {
  const filtered = filter(options, state);
  const matches = filtered.filter(
    option =>
      option.label.toLowerCase().includes(state.inputValue.toLowerCase()) ||
      option.ticker.toLowerCase().includes(state.inputValue.toLowerCase()),
  );
  return matches;
}

export const StockExchangeAutocomplete: React.FC<IStockExchangeAutocompleteProps> = ({
  value,
  defaultValue,
  onChange,
  textFieldProps,
}) => {
  const {loading: isLoadingStockExchanges, selectOptions, error} = useFetchStockExchanges();

  return (
    <Autocomplete
      options={selectOptions}
      getOptionLabel={option => {
        if (typeof option === 'string') return option;
        return option.label;
      }}
      value={value}
      onChange={onChange}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      defaultValue={defaultValue}
      loadingText="Loading..."
      loading={isLoadingStockExchanges}
      selectOnFocus
      autoHighlight
      renderInput={params => (
        <TextField
          label="Category"
          {...textFieldProps}
          error={error !== null}
          helperText={error?.message}
          {...params}
        />
      )}
      renderOption={(props, option, {selected}) => (
        <StyledAutocompleteOption {...props} key={option.value} selected={selected}>
          <Box>
            <Typography variant="body1">{option.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {option.ticker}
            </Typography>
          </Box>
        </StyledAutocompleteOption>
      )}
    />
  );
};
