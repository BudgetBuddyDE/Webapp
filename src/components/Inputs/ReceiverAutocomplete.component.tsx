import React from 'react';
import { Autocomplete, SxProps, TextField, Theme, createFilterOptions } from '@mui/material';
import { StyledAutocompleteOption } from './StyledAutocompleteOption.component';

export type TOption = {
    text: string;
    value: string;
};

export type TReceiverAutocompleteProps = {
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
export const ReceiverAutocomplete: React.FC<TReceiverAutocompleteProps> = ({
    sx,
    id,
    label,
    options,
    defaultValue = null,
    onValueChange,
}) => {
    const [value, setValue] = React.useState<TOption | null>(
        defaultValue ? { text: defaultValue, value: defaultValue } : null
    );

    React.useEffect(() => onValueChange(value?.value || ''), [value, onValueChange]);

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
            renderOption={(props, option, { selected }) => (
                <StyledAutocompleteOption {...props} selected={selected}>
                    {option.text}
                </StyledAutocompleteOption>
            )}
            renderInput={(params) => <TextField {...params} label={label} />}
            isOptionEqualToValue={(option, value) => true}
            selectOnFocus
        />
    );
};
