import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { CategoryService, CreateCategoryAlert, useFetchCategories } from '../';
import { StyledAutocompleteOption } from '@/components/Base';
import { useFetchTransactions } from '@/core/Transaction';

export type TCategoryInputOption = {
  label: string;
  value: number | string;
  shouldCreate?: boolean;
};

export type TCategoryAutocompleteProps = {
  defaultValue?: TCategoryInputOption | null;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: TCategoryInputOption | null
  ) => void;
  sx?: SxProps<Theme>;
  required?: boolean;
};

const filter = createFilterOptions<TCategoryInputOption>();

/**
 * Applies a filter to the category options.
 *
 * @param options The category options to filter.
 */
export function applyCategoryOptionsFilter(
  options: TCategoryInputOption[],
  state: FilterOptionsState<TCategoryInputOption>
): TCategoryInputOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter((option) =>
    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
  );
  if (matches.length > 0) {
    const completeMatch = matches.find((match) => match.label === state.inputValue);
    return completeMatch
      ? [completeMatch]
      : [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }, ...matches];
  } else return [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }];
}

/**
 * Retrieves the name from a label.
 *
 * @param label The label to extract the name from.
 * @returns The extracted name.
 */
export function getNameFromLabel(label: string): string {
  const splitted = label.split('"');
  return splitted[1];
}

export const CategoryAutocomplete: React.FC<TCategoryAutocompleteProps> = ({
  defaultValue = undefined,
  onChange,
  sx,
  required = false,
}) => {
  const id = React.useId();
  const navigate = useNavigate();
  const { loading: loadingTransactions, transactions } = useFetchTransactions();
  const { loading: loadingCategories, categories, error: categoryError } = useFetchCategories();

  const options: TCategoryInputOption[] = React.useMemo(() => {
    return CategoryService.sortAutocompleteOptionsByTransactionUsage(categories, transactions);
  }, [categories, transactions]);

  if (categoryError) {
    console.log('CategoryAutocomplete.component.tsx: categoryError: ', categoryError);
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        <Typography>{String(!categoryError)}</Typography>
      </Alert>
    );
  }
  if (!loadingCategories && categories.length === 0) {
    return <CreateCategoryAlert sx={sx} />;
  }
  return (
    <Autocomplete
      id={id + '-create-category'}
      options={options}
      onChange={(event, value, _details) => {
        if (!value) return;
        const categoryNameExists = categories.some((category) => category.name === value.label);
        if (categoryNameExists) return onChange(event, value);
        const queryParams = new URLSearchParams({
          create: 'true',
          category: getNameFromLabel(value.label),
        });
        navigate('/categories?' + queryParams.toString(), { replace: true });
      }}
      filterOptions={applyCategoryOptionsFilter}
      renderOption={(props, option, { selected }) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
      defaultValue={defaultValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Category"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loadingCategories && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          required={required}
        />
      )}
      disabled={loadingCategories || loadingTransactions}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      loading={loadingCategories || loadingTransactions}
      sx={sx}
    />
  );
};
