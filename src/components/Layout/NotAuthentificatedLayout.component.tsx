import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Main } from '../Base/Main.component';
import { Footer } from '../Core/Footer.component';

export type NotAuthentificatedLayoutProps = React.PropsWithChildren<{}>;

export const NotAuthentificatedLayout: React.FC<NotAuthentificatedLayoutProps> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Main
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    overflow: 'auto',
                    height: '100vh',
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
                    {children}
                    <Outlet />
                </Container>

                <Box sx={{ mt: 'auto' }}>
                    <Footer />
                </Box>
            </Main>
        </Box>
    );
};
