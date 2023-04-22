import type { DialogProps as MuiDialogProps } from '@mui/material';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog.component';
import { EditDialog, EditDialogActions } from './EditDialog.component';
import { SelectActions } from './SelectActions.component';
import type { SelectActionsProps } from './SelectActions.component';
import { SelectAllCheckbox } from './SelectAllCheckbox.component';
import { SelectSingleCheckbox } from './SelectSingleCheckbox.component';

export type { EditDialogActions } from './EditDialog.component';
export type DialogType = 'EDIT' | 'DELETE';
export type DialogProps = Pick<MuiDialogProps, 'open' | 'onClose' | 'maxWidth'> & {
  onCancel: () => void;
  onConfirm: () => void;
};
export type DeleteDialogProps = DialogProps;
export type EditDialogProps = Omit<DialogProps, 'onConfirm'> & {
  onUpdate: (action: EditDialogActions, id: number) => void;
};
export type SelectMultipleHandler = {
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onSelectSingle: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  actionBar: Pick<SelectActionsProps, 'onEdit' | 'onDelete'>;
  dialog: Pick<DialogProps, 'onClose'> & {
    onEditConfirm?: EditDialogProps['onUpdate'];
    onEditCancel?: EditDialogProps['onCancel'];
    onDeleteConfirm?: DeleteDialogProps['onConfirm'];
    onDeleteCancel?: DeleteDialogProps['onCancel'];
  };
};

export const SelectMultiple = {
  Actions: SelectActions,
  EditDialog: EditDialog,
  ConfirmDeleteDialog: ConfirmDeleteDialog,
  SelectAllCheckbox: SelectAllCheckbox,
  SelectSingleCheckbox: SelectSingleCheckbox,
};
