import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchCategories } from '@/hook/useFetchCategories.hook';
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
import { StyledAutocompleteOption } from '../Inputs/StyledAutocompleteOption.component';
import { CreateCategoryAlert } from './CreateCategoryAlert.component';

export type CategoryInputOption = {
    label: string;
    value: number | string;
    shouldCreate?: boolean;
};

export type CategoryAutocompleteProps = {
    defaultValue?: CategoryInputOption | null;
    onChange: (event: React.SyntheticEvent<Element, Event>, value: CategoryInputOption | null) => void;
    sx?: SxProps<Theme>;
};

const filter = createFilterOptions<CategoryInputOption>();

export function applyCategoryOptionsFilter(
    options: CategoryInputOption[],
    state: FilterOptionsState<CategoryInputOption>
): CategoryInputOption[] {
    if (state.inputValue.length < 1) return options;
    const filtered = filter(options, state);
    const matches = filtered.filter((option) => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
    if (matches.length > 0) {
        const completeMatch = matches.find((match) => match.label === state.inputValue);
        return completeMatch
            ? [completeMatch]
            : [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }, ...matches];
    } else return [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }];
}

export const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
    defaultValue = undefined,
    onChange,
    sx,
}) => {
    const id = React.useId();
    const navigate = useNavigate();
    const { loading: loadingCategories, categories, error } = useFetchCategories();

    if (!loadingCategories && categories.length === 0 && !error) {
        if (error) {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    <Typography>{String(error)}</Typography>
                </Alert>
            );
        } else return <CreateCategoryAlert sx={sx} />;
    } else if (!loadingCategories && error) console.error('CategoryAutocomplete: ' + error);
    return (
        <Autocomplete
            id={id + '-create-category'}
            options={categories.map((item) => ({ label: item.name, value: item.id }))}
            onChange={(event, value, _details) => {
                if (!value) return;
                const categoryNameExists = categories.some((category) => category.name === value.label);
                if (categoryNameExists) return onChange(event, value);
                navigate('/categories', { state: { create: true, category: { name: value.label.split('"')[1] } } });
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
                />
            )}
            disabled={loadingCategories}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            loading={loadingCategories}
            sx={sx}
        />
    );
};
