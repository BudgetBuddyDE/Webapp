import * as React from 'react';
import { Autocomplete, createFilterOptions, SxProps, TextField, Theme } from '@mui/material';
import { StoreContext } from '../../context/store.context';
import { useNavigate } from 'react-router-dom';

export interface ICategoryAutocompleteOption {
  shouldCreate?: boolean;
  label: string;
  value: number;
}

export interface ICategoryAutocompleteProps {
  options: ICategoryAutocompleteOption[];
  defaultValue?: ICategoryAutocompleteOption | null | undefined;
  onChange: (event: React.SyntheticEvent, value: ICategoryAutocompleteOption | null) => void;
  id?: string;
  label?: string;
  sx?: SxProps<Theme>;
}

const filter = createFilterOptions<ICategoryAutocompleteOption>();

export const CategoryAutocomplete: React.FC<ICategoryAutocompleteProps> = ({
  options,
  defaultValue,
  onChange,
  id = 'category-autocomplete',
  label = 'Category',
  sx,
}) => {
  const navigate = useNavigate();
  const { categories } = React.useContext(StoreContext);

  return (
    <Autocomplete
      id={id}
      options={options}
      sx={sx}
      onChange={(event, value) => {
        // Check if seleted category was already created or if the user wants to create this category
        const createCategory =
          categories.findIndex(
            (category) => category.name === value?.label && category.id === value.value
          ) === -1;
        if (createCategory) {
          if (!value) return;
          navigate('/categories', {
            replace: true,
            state: { showDialog: true, category: { name: value.label.split('"')[1] } },
          });
        } else onChange(event, value);
      }}
      filterOptions={(options, state) => {
        if (state.inputValue.length < 1) return options;
        const filtered = filter(options, state);
        const addCreateOption =
          filtered.findIndex(
            (option) => option.label.toLowerCase() === state.inputValue.toLowerCase()
          ) === -1;
        if (addCreateOption) {
          filtered.push({
            shouldCreate: true,
            label: `Create "${state.inputValue}"`,
            value: Math.random() * -1000,
          });
        }
        return filtered;
      }}
      defaultValue={defaultValue}
      renderInput={(props) => <TextField {...props} label={label} />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};
