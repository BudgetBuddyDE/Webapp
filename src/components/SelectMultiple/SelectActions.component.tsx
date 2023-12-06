import React from 'react';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

export type SelectActionsProps = {
  amount: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const SelectActions: React.FC<SelectActionsProps> = ({ amount, onEdit, onDelete }) => {
  if (amount === 0) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        mt: 1,
        py: 1,
        px: 2,
      }}
    >
      <Typography>{amount} selected</Typography>

      {onEdit && (
        <Button startIcon={<EditIcon />} size="small" onClick={onEdit} sx={{ ml: 2 }}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button startIcon={<DeleteIcon />} size="small" onClick={onDelete} sx={{ ml: 1 }}>
          Delete
        </Button>
      )}
    </Box>
  );
};
