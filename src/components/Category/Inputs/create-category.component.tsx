import { Autocomplete, SxProps, TextField, Theme } from '@mui/material';
import React from 'react';
import { useFetchCategories } from '../../../hooks';
import { CreateCategoryInfo } from '../Cards';

export type CategoryInputOption = {
  label: string;
  value: number | string;
};

export interface CreateCategoryInputProps {
  defaultValue?: CategoryInputOption | null;
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: CategoryInputOption | null) => void;
  sx?: SxProps<Theme>;
}

export const CreateCategoryInput: React.FC<CreateCategoryInputProps> = ({ defaultValue = undefined, onChange, sx }) => {
  const id = React.useId();
  const { loading, categories, error } = useFetchCategories();

  if (loading) {
    return null;
  }
  if (!loading && categories.length < 1) return <CreateCategoryInfo sx={sx} />;
  if (!loading && categories.length === 0 && error) {
    return null;
  }
  if (!loading && error) console.error('CreateCategoryInput: ' + error);
  return (
    <Autocomplete
      id={id + '-create-category'}
      options={categories.map((item) => ({ label: item.name, value: item.id }))}
      onChange={onChange}
      defaultValue={defaultValue}
      renderInput={(props) => <TextField {...props} label="Category" />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      sx={sx}
    />
  );
};
