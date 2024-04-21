import {type TStockExchange} from '@budgetbuddyde/types';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  type TextFieldProps,
  type AutocompleteChangeReason,
} from '@mui/material';
import {useFetchStockExchanges} from './useFetchStockExchanges.hook';
import {StyledAutocompleteOption} from '@/components/Base';

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
