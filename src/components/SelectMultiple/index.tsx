import React from 'react';
import { type DialogProps as MuiDialogProps, Slide } from '@mui/material';
import { type TransitionProps } from '@mui/material/transitions';
import { ConfirmDeleteDialog, type DeleteDialogProps } from './ConfirmDeleteDialog.component';
import { EditDialog, type EditDialogProps } from './EditDialog.component';
import { SelectActions } from './SelectActions.component';
import { type SelectActionsProps } from './SelectActions.component';
import { SelectAllCheckbox } from './SelectAllCheckbox.component';
import { SelectSingleCheckbox } from './SelectSingleCheckbox.component';

export type * from './ConfirmDeleteDialog.component';
export type * from './EditDialog.component';
export type * from './SelectActions.component';
export type * from './SelectAllCheckbox.component';
export type * from './SelectSingleCheckbox.component';

export type DialogType = 'EDIT' | 'DELETE';

export type DialogProps = Pick<
  MuiDialogProps,
  'open' | 'onClose' | 'maxWidth' | 'TransitionComponent' | 'TransitionProps' | 'transitionDuration'
> & {
  onCancel: () => void;
  onConfirm: () => void;
  withTransition?: boolean;
};

export interface ISelectMultipleHandler {
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onSelectSingle: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  actionBar: Pick<SelectActionsProps, 'onEdit' | 'onDelete'>;
  dialog: Pick<DialogProps, 'onClose'> & {
    onEditConfirm?: EditDialogProps['onUpdate'];
    onEditCancel?: EditDialogProps['onCancel'];
    onDeleteConfirm?: DeleteDialogProps['onConfirm'];
    onDeleteCancel?: DeleteDialogProps['onCancel'];
  };
}

export const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const SelectMultiple = {
  Actions: SelectActions,
  EditDialog: EditDialog,
  ConfirmDeleteDialog: ConfirmDeleteDialog,
  SelectAllCheckbox: SelectAllCheckbox,
  SelectSingleCheckbox: SelectSingleCheckbox,
};
