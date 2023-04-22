import { Checkbox as MuiCheckbox, TableCell } from '@mui/material';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material';
import React from 'react';

export type SelectAllCheckboxProps = Pick<MuiCheckboxProps, 'onChange' | 'indeterminate' | 'checked'> & {
  withTableCell?: boolean;
};

export const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({
  onChange,
  indeterminate,
  checked,
  withTableCell = false,
}) => {
  const Checkbox = () => <MuiCheckbox onChange={onChange} indeterminate={indeterminate} checked={checked} />;
  return withTableCell ? (
    <TableCell sx={{ width: '1%', whiteSpace: 'nowrap' }}>
      <Checkbox />
    </TableCell>
  ) : (
    <Checkbox />
  );
};
