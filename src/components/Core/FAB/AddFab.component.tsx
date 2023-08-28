import React from 'react';
import { AddRounded as AddIcon } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { FabProps } from '@mui/material';

export type AddFabProps = {
  onClick: FabProps['onClick'];
};

export const AddFab: React.FC<AddFabProps> = ({ onClick }) => {
  return (
    <Fab color="primary" variant="extended" aria-label="add" onClick={onClick}>
      <AddIcon sx={{ mr: 1 }} />
      Add
    </Fab>
  );
};
