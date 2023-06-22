import React from 'react';
import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';

export type ActionPaperProps = React.PropsWithChildren<PaperProps>;

export const ActionPaper: React.FC<ActionPaperProps> = (props) => (
    <Paper
        elevation={2}
        {...props}
        sx={{
            boxShadow: 'none',
            border: 'none',
            ...props.sx,
        }}
    >
        {props.children}
    </Paper>
);
