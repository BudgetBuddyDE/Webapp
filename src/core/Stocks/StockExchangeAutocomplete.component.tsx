import {
  Autocomplete,
  TextField,
  type SxProps,
  type Theme,
  createFilterOptions,
  FilterOptionsState,
  CircularProgress,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import React from 'react';
import { StockExchanges, type TStockExchange } from './index';
import { StyledAutocompleteOption } from '@/components/Base';

export type TStockExchangeInputOption = TStockExchange;

export type TStockExchangeAutocompleteProps = {
  defaultValue?: TStockExchangeInputOption | null;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: TStockExchangeInputOption | null
  ) => void;
  sx?: SxProps<Theme>;
  required?: boolean;
};

const filter = createFilterOptions<TStockExchangeInputOption>();

function applyStockExchangeOptionFilter(
  options: TStockExchangeInputOption[],
  state: FilterOptionsState<TStockExchangeInputOption>
) {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  return filtered;
}

export const StockExchangeAutocomplete: React.FC<TStockExchangeAutocompleteProps> = ({
  defaultValue = undefined,
  onChange,
  sx,
  required = false,
}) => {
  const id = React.useId();
  const options: TStockExchangeInputOption[] = React.useMemo(() => {
    return StockExchanges;
  }, [StockExchanges]);

  const isLoadingStockExchanges = false;
  return (
    <Autocomplete
      id={id + '-choose-stock-exchange'}
      options={options}
      onChange={(event, value, _details) => {
        if (!value) return;
        return onChange(event, value);
      }}
      filterOptions={applyStockExchangeOptionFilter}
      getOptionLabel={(option) => option.label}
      renderOption={(props, option, { selected }) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          <Box sx={{ display: 'flex' }}>
            <Chip label={option.symbol} size="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{option.label}</Typography>
          </Box>
        </StyledAutocompleteOption>
      )}
      defaultValue={defaultValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Stock Exchange"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoadingStockExchanges && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          required={required}
        />
      )}
      disabled={isLoadingStockExchanges}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      loading={isLoadingStockExchanges}
      sx={sx}
    />
  );
};
