import { Box } from '@mui/material';
import React from 'react';

export const FabContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'flex-end',
        rowGap: '1rem',
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
      }}
    >
      {children}
    </Box>
  );
};
