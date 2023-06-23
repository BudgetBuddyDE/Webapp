import React from 'react';
import { Box } from '@mui/material';

export type FabContainerProps = React.PropsWithChildren;

export const FabContainer: React.FC<FabContainerProps> = ({ children }) => {
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
