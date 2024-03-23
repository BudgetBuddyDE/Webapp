import React from 'react';
import { debounce } from 'lodash';
import { Autocomplete, Box, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { useSnackbarContext } from '../Snackbar';
import { type TAssetSearchResult } from './types';
import { Image, StyledAutocompleteOption } from '@/components/Base';
import { StockService } from './Stock.service';
import { useAuthContext } from '../Auth';

export type TSearchStockOption = {
  /**
   * Company name
   */
  label: string;
  /**
   * ISIN
   */
  isin: string;
  logo: string;
  type: string;
};

export type TSearchStockProps = {
  onChange: (value: TSearchStockOption | null) => void;
};

interface ISearchStockHandler {
  onInputChange: (searchTerm: string) => void;
}

const EVENT_DEBOUNCE_TIME = 400;

export const SearchStock: React.FC<TSearchStockProps> = ({ onChange }) => {
  const { authOptions } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<TAssetSearchResult[]>([]);

  const options: TSearchStockOption[] = React.useMemo(() => {
    return searchResults
      .filter((result) => result.type !== 'Crypto')
      .map((result) => ({
        label: result.name,
        isin: result.identifier,
        logo: result.logo,
        type: result.type,
      }));
  }, [searchResults]);

  const handler: ISearchStockHandler = {
    onInputChange(term: string) {
      setSearchTerm(term);
    },
  };

  const searchStocks = async () => {
    if (searchTerm.length < 1) return setSearchResults([]);
    setLoading(true);
    try {
      const [matches, error] = await StockService.searchAsset(searchTerm, authOptions);
      if (error) throw error;
      if (!matches) return setSearchResults([]);
      // console.log(matches);
      setSearchResults(matches);
    } catch (err) {
      console.error(err);
      showSnackbar({ message: 'Error fetching stocks' });
    }
    setLoading(false);
  };

  React.useLayoutEffect(() => {
    searchStocks();

    return () => {
      setLoading(false);
      setSearchTerm('');
    };
  }, [searchTerm]);

  return (
    <Autocomplete
      options={options}
      onChange={(_event, value) => onChange(value)}
      onInputChange={debounce((_event, value) => handler.onInputChange(value), EVENT_DEBOUNCE_TIME)}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => <TextField {...params} label="Stock" required />}
      renderOption={(props, option, { selected }) => {
        return (
          <StyledAutocompleteOption {...props} key={option.isin} selected={selected}>
            <Grid container alignItems="center">
              <Grid item sx={{ display: 'flex', width: '40px' }}>
                <Image
                  src={option.logo}
                  alt={option.label + ' logo'}
                  sx={{ width: '40px', height: '40px' }}
                />
              </Grid>
              <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word', pl: 1 }}>
                <Typography variant="body1">{option.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.type} - {option.isin}
                </Typography>
              </Grid>
            </Grid>
          </StyledAutocompleteOption>
        );
      }}
      isOptionEqualToValue={(option, value) => option.isin === value.isin}
      loadingText={
        loading && (
          <Box sx={{ display: 'flex' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Searching stocks...</Typography>
          </Box>
        )
      }
      loading={loading}
      selectOnFocus
      fullWidth
    />
  );
};
