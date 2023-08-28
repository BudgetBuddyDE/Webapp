import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DeleteDialogProps } from '.';

export const ConfirmDeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  maxWidth = 'xs',
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} PaperProps={{ elevation: 0 }}>
      <DialogTitle id="alert-dialog-title">Attention</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete these saved entries irrevocably?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onConfirm}
          // focusRipple={false}
          // sx={{
          //   ':focus': {
          //     backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          //   },
          // }}
          autoFocus
        >
          Yes, delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
