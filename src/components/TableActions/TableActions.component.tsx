import React from 'react';
import ReactDOM from 'react-dom';
import { DeleteRounded, EditRounded } from '@mui/icons-material';
import { Button, ButtonProps, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { type SelectAllCheckboxProps } from '../SelectMultiple';

export type TableActionsProps = React.PropsWithChildren<
  Omit<SelectAllCheckboxProps, 'withTableCell'> & {
    count?: number;
    onEdit?: ButtonProps['onClick'];
    onDelete?: ButtonProps['onClick'];
    actions?: Pick<ButtonProps, 'startIcon' | 'children' | 'onClick'>[];
    destination: Element | DocumentFragment | null;
  }
>;

export const TableActions: React.FC<TableActionsProps> = ({
  destination,
  children,
  count,
  onEdit,
  onDelete,
  onChange,
  checked,
  indeterminate,
  actions,
}) => {
  const id = React.useId();

  if (!destination || (!checked && !indeterminate)) {
    return children;
  }
  return ReactDOM.createPortal(
    <Stack
      direction="row"
      alignItems="center"
      sx={{ pr: 1, pl: count ? 3.5 : 2, py: { xs: 2.4, md: 2 }, borderBottom: '1px solid rgba(62, 71, 81, 1)' }}
    >
      {count && count > 0 ? (
        <FormControlLabel
          control={<Checkbox onChange={onChange} checked={checked} indeterminate={indeterminate} />}
          label={count + ' selected'}
        />
      ) : (
        <Checkbox onChange={onChange} checked={checked} indeterminate={indeterminate} />
      )}

      {onEdit && (
        <Button startIcon={<EditRounded />} onClick={onEdit} size="small" sx={{ mr: 1 }}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button startIcon={<DeleteRounded />} onClick={onDelete} size="small" sx={{ mr: 1 }}>
          Delete
        </Button>
      )}
      {actions &&
        actions.map((action, idx) => (
          <Button key={id + '-table-action-' + idx} {...action} size="small" sx={{ mr: 1 }} />
        ))}
    </Stack>,
    destination
  );
};
