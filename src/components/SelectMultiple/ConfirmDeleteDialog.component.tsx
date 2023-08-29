import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { type DialogProps, Transition } from './index';

export type DeleteDialogProps = DialogProps & { count?: number };

export const ConfirmDeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  maxWidth = 'xs',
  onCancel,
  onConfirm,
  count,
  withTransition = false,
  ...transitionProps
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      PaperProps={{ elevation: 0 }}
      {...transitionProps}
      TransitionComponent={
        withTransition
          ? !transitionProps.TransitionComponent
            ? Transition
            : transitionProps.TransitionComponent
          : undefined
      }
    >
      <DialogTitle variant="h2" textAlign="center">
        Attention
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="inherit" textAlign="center">
          You are about to delete the selected {count && count} entries?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Yes, delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
