import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { Footer } from '../Core/Footer.component';

const Main = styled('main')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'inherit',
    justifyContent: 'center',
    alignItems: 'center',
}));

export type NotAuthentificatedLayoutProps = React.PropsWithChildren<{
    useOutlet?: boolean;
}>;

export const NotAuthentificatedLayout: React.FC<NotAuthentificatedLayoutProps> = ({ children, useOutlet = false }) => {
    return (
        <Main>
            <Box sx={{ width: '100%', mt: 'auto' }}>
                {useOutlet && <Outlet />}
                {children}
            </Box>
            <Box sx={{ mt: 'auto' }} children={<Footer />} />
        </Main>
    );
};
