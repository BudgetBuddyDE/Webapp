import React from 'react';
import { Paper, type PaperProps } from '@mui/material';

export type TActionPaperProps = React.PropsWithChildren<PaperProps>;

export const ActionPaper: React.FC<TActionPaperProps> = React.forwardRef((props, ref) => (
  <Paper
    elevation={2}
    {...props}
    sx={{
      boxShadow: 'none',
      border: 'none',
      ...props.sx,
    }}
    ref={ref}
  >
    {props.children}
  </Paper>
));
