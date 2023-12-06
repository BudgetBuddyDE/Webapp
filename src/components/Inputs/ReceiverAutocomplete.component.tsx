import React from 'react';
import {
  Autocomplete,
  type FilterOptionsState,
  type SxProps,
  TextField,
  type Theme,
  createFilterOptions,
} from '@mui/material';
import { StyledAutocompleteOption } from './StyledAutocompleteOption.component';

export type AutocompleteOption = {
  label: string;
  value: string;
};

export type TReceiverAutocompleteProps = {
  sx?: SxProps<Theme>;
  id?: string;
  label: string;
  options: AutocompleteOption[];
  defaultValue?: string;
  onValueChange: (value: string | number) => void;
};

const filter = createFilterOptions<AutocompleteOption>();

export function applyReceiverOptionsFilter(
  options: AutocompleteOption[],
  state: FilterOptionsState<AutocompleteOption>
): AutocompleteOption[] {
  if (state.inputValue.length < 1) return options;
  const filtered = filter(options, state);
  const matches = filtered.filter((option) => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
  if (matches.length > 0) {
    const completeMatch = matches.find((match) => match.label === state.inputValue);
    return completeMatch
      ? [completeMatch]
      : [{ label: `Create "${state.inputValue}"`, value: state.inputValue }, ...matches];
  } else return [{ label: `Create "${state.inputValue}"`, value: state.inputValue }];
}

/**
 * Docs:
 * - [Material UI reference](https://mui.com/material-ui/react-autocomplete/#creatable)
 */
export const ReceiverAutocomplete: React.FC<TReceiverAutocompleteProps> = ({
  sx,
  id,
  label,
  options,
  defaultValue = null,
  onValueChange,
}) => {
  const [value, setValue] = React.useState<AutocompleteOption | null>(
    defaultValue ? { label: defaultValue, value: defaultValue } : null
  );

  React.useEffect(() => onValueChange(value?.value || ''), [value, onValueChange]);

  return (
    <Autocomplete
      sx={sx}
      id={id}
      options={options}
      value={value}
      onChange={(_event, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            label: newValue,
            value: newValue,
          });
        } else if (newValue && newValue.value) {
          setValue({
            label: newValue.value,
            value: newValue.value,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={applyReceiverOptionsFilter}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.value) {
          return option.value;
        }
        // Regular option
        return option.label;
      }}
      renderOption={(props, option, { selected }) => (
        <StyledAutocompleteOption {...props} selected={selected}>
          {option.label}
        </StyledAutocompleteOption>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => {
        return option.value == value.value && option.label == value.label;
      }}
      selectOnFocus
    />
  );
};
