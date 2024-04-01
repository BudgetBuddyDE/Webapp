import React from 'react';
import {Autocomplete, Box, TextField, Typography} from '@mui/material';
import {StyledAutocompleteOption} from '@/components/Base';

export type TSelectStockExchangeOption = {
  label: string;
  ticker: string;
  value: string;
};

export const StockExchangeOptions = Object.entries({
  langschwarz: {
    label: 'Lang & Schwarz Exchange',
    ticker: 'LSX',
  },
  gettex: {
    label: 'Gettex',
    // GETTEXT -> GGTX because of char(5)
    ticker: 'GTX',
  },
}).map(([key, value]) => ({
  label: value.label,
  ticker: value.ticker,
  value: key,
}));

export type TSelectStockExchangeProps = {
  onChange: (value: TSelectStockExchangeOption | null) => void;
  defaultValue?: TSelectStockExchangeOption | null;
};

export const SelectStockExchange: React.FC<TSelectStockExchangeProps> = ({onChange, defaultValue}) => {
  return (
    <Autocomplete
      options={StockExchangeOptions}
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
      defaultValue={defaultValue}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      selectOnFocus
      fullWidth
    />
  );
};
