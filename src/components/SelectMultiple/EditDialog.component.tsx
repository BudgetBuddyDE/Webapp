import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React from 'react';
import type { EditDialogProps } from '.';
import { CreateCategoryInput } from '../Category/';
import { CreatePaymentMethodInput } from '../PaymentMethod';

export type EditDialogActions = 'PAYMENT_METHOD' | 'CATEGORY';

export const EditDialog: React.FC<EditDialogProps> = ({ open, onClose, maxWidth = 'xs', onCancel, onUpdate }) => {
  const [action, setAction] = React.useState<EditDialogActions | null>(null);
  const [id, setId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      setAction(null);
      setId(null);
      setError(null);
    };
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth}>
      <DialogTitle id="alert-dialog-title">Attention</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error">
            <AlertTitle>Invalid option</AlertTitle>
            <Typography>{error}</Typography>
          </Alert>
        )}

        <DialogContentText sx={{ mb: 1 }}>What field do you wanna change on these entries?</DialogContentText>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-edit-action-label">Action</InputLabel>
          <Select
            labelId="select-edit-action-label"
            id="select-edit-action"
            label="Action"
            value={action ?? ''}
            onChange={(event) => setAction(event.target.value as EditDialogActions)}
          >
            <MenuItem value="PAYMENT_METHOD">Payment Method</MenuItem>
            <MenuItem value="CATEGORY">Category</MenuItem>
          </Select>
        </FormControl>

        {action === 'CATEGORY' ? (
          <CreateCategoryInput onChange={(event, value) => setId(value ? Number(value.value) : null)} />
        ) : (
          <CreatePaymentMethodInput onChange={(event, value) => setId(value ? Number(value.value) : null)} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            if (!action) {
              return setError('You have to select an action before saving!');
            }
            if (!id) {
              return setError(
                `You have to select a new ${action === 'CATEGORY' ? 'category' : 'payment-method'} before saving!`
              );
            }

            onUpdate(action, id);
          }}
          autoFocus
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
