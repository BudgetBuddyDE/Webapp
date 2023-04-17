import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  CircularProgress,
  SxProps,
  TextField,
  Theme,
  Typography,
  createFilterOptions,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchCategories } from '../../../hooks';
import { CreateCategoryInfo } from '../Cards';

export type CategoryInputOption = {
  label: string;
  value: number | string;
  shouldCreate?: boolean;
};

export interface CreateCategoryInputProps {
  defaultValue?: CategoryInputOption | null;
  onChange: (event: React.SyntheticEvent<Element, Event>, value: CategoryInputOption | null) => void;
  sx?: SxProps<Theme>;
}

const filter = createFilterOptions<CategoryInputOption>();

export const CreateCategoryInput: React.FC<CreateCategoryInputProps> = ({ defaultValue = undefined, onChange, sx }) => {
  const id = React.useId();
  const navigate = useNavigate();
  const { loading, categories, error } = useFetchCategories();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...sx,
        }}
      >
        <CircularProgress size="small" />
      </Box>
    );
  }
  if (!loading && categories.length < 1) return <CreateCategoryInfo sx={sx} />;
  if (!loading && categories.length === 0 && error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        <Typography>{String(error)}</Typography>
      </Alert>
    );
  }
  if (!loading && error) console.error('CreateCategoryInput: ' + error);
  return (
    <Autocomplete
      id={id + '-create-category'}
      options={categories.map((item) => ({ label: item.name, value: item.id }))}
      onChange={(event, value, details) => {
        if (!value) return;
        const categoryNameExists = categories.some((category) => category.name === value.label);
        if (categoryNameExists) return onChange(event, value);
        navigate('/categories', {
          state: { create: true, category: { name: value.label.split('"')[1] } },
        });
      }}
      filterOptions={(options, state) => {
        if (state.inputValue.length < 1) return options;
        const filtered = filter(options, state);
        const match = filtered.some((option) => option.label.toLowerCase().includes(state.inputValue.toLowerCase()));
        return match ? filtered : [{ shouldCreate: true, label: `Create "${state.inputValue}"`, value: -1 }];
      }}
      defaultValue={defaultValue}
      renderInput={(props) => <TextField {...props} label="Category" />}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      sx={sx}
    />
  );
};