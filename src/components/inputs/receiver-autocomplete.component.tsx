import { FC, useEffect, useState } from 'react';
import { TextField, Autocomplete, createFilterOptions, SxProps, Theme } from '@mui/material';

type TOption = {
  text: string;
  value: string;
};

type TReceiverAutocompleteProps = {
  sx?: SxProps<Theme>;
  id?: string;
  label: string;
  options: TOption[];
  defaultValue?: string;
  onValueChange: (value: string | number) => void;
};

const filter = createFilterOptions<TOption>();

/**
 * Docs:
 * - [Material UI reference](https://mui.com/material-ui/react-autocomplete/#creatable)
 */
export const ReceiverAutocomplete: FC<TReceiverAutocompleteProps> = ({
  sx,
  id,
  label,
  options,
  defaultValue = null,
  onValueChange,
}) => {
  const [value, setValue] = useState<TOption | null>(
    defaultValue ? { text: defaultValue, value: defaultValue } : null
  );

  useEffect(() => onValueChange(value?.value || ''), [value]);

  return (
    <Autocomplete
      sx={sx}
      id={id}
      options={options}
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            text: newValue,
            value: newValue,
          });
        } else if (newValue && newValue.value) {
          setValue({
            text: newValue.value,
            value: newValue.value,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        const isExisting = options.some((option) => inputValue === option.text);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            value: inputValue,
            text: `Add "${inputValue}"`,
          });
        }
        return filtered;
      }}
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
        return option.text;
      }}
      renderOption={(props, option) => <li {...props}>{option.text}</li>}
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      selectOnFocus
    />
  );
};
