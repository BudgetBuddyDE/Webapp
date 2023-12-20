import React from 'react';
import { Typography, Paper, type PaperProps } from '@mui/material';

export type TNotVerifiedProps = { paperProps?: PaperProps };

export const NotVerified: React.FC<TNotVerifiedProps> = ({ paperProps }) => {
  return (
    <Paper
      {...paperProps}
      sx={{
        width: { xs: '100%', md: 'calc(100%/3)' },
        p: 2,
        ...paperProps?.sx,
        textAlign: 'center',
        mx: 'auto',
      }}
    >
      <Typography variant="h2">Not Verified</Typography>
      <Typography variant="body1">Please check your email to verify your account.</Typography>
    </Paper>
  );
};
