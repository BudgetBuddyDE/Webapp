import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import React from 'react';

export const ActionPaper: React.FC<React.PropsWithChildren<PaperProps>> = (props) => (
  <Paper
    elevation={2}
    {...props}
    sx={{
      boxShadow: 'none',
      ...props.sx,
    }}
  >
    {props.children}
  </Paper>
);
