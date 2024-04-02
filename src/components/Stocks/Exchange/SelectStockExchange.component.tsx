import React from 'react';
import {Alert, Autocomplete, Box, TextField, Typography} from '@mui/material';
import {StyledAutocompleteOption} from '@/components/Base';
import {useFetchStockExchanges} from '@/components/Stocks/Exchange';
import {TStockExchange} from '@budgetbuddyde/types';

export type TSelectStockExchangeOption = {
  label: string;
  ticker: string;
  value: string;
};

export type TSelectStockExchangeProps = {
  onChange: (value: TSelectStockExchangeOption | null) => void;
  defaultValue?: TStockExchange['id'] | undefined | null;
};

export const SelectStockExchange: React.FC<TSelectStockExchangeProps> = ({onChange, defaultValue}) => {
  const {loading, selectOptions, error} = useFetchStockExchanges();

  React.useEffect(() => console.log('defaultValue', defaultValue), [defaultValue]);

  if (!loading && error) {
    return <Alert severity="error">{error.message}</Alert>;
  }
  return (
    <Autocomplete
      options={selectOptions}
      onChange={(_event, value) => onChange(value)}
      getOptionLabel={option => option.label}
      renderInput={params => <TextField {...params} label="Stock Exchange" required />}
      renderOption={(props, option, {selected}) => {
        return (
          <StyledAutocompleteOption {...props} key={option.value} selected={selected}>
            <Box>
              <Typography variant="body1">{option.label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.ticker}
              </Typography>
            </Box>
          </StyledAutocompleteOption>
        );
      }}
      defaultValue={selectOptions.find(option => option.value === defaultValue) || null}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      loading={loading}
      loadingText={loading ? 'Loading stock exchanges...' : undefined}
      selectOnFocus
      fullWidth
    />
  );
};
