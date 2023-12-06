import React from 'react';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { type CheckboxProps as MuiCheckboxProps } from '@mui/material';

export type SelectSingleCheckboxProps = Pick<MuiCheckboxProps, 'onChange' | 'value' | 'checked'>;

export const SelectSingleCheckbox: React.FC<SelectSingleCheckboxProps> = ({ onChange, value, checked }) => {
  return <MuiCheckbox onChange={onChange} value={value} checked={checked} />;
};
