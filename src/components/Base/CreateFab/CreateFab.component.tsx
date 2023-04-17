import { Add as AddIcon } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { FabProps } from '@mui/material';
import React from 'react';

export type CreateFab = {
  onClick: FabProps['onClick'];
};

export const CreateFab: React.FC<CreateFab> = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
      }}
    >
      <AddIcon />
    </Fab>
  );
};
