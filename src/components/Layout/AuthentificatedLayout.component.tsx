import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@/context/Auth.context';
import { Box, Container } from '@mui/material';
import { Main } from '../Base/Main.component';
import { Appbar } from '../Core/Appbar.component';
import { Drawer } from '../Core/Drawer/Drawer.component';
import { FilterDrawer } from '../Core/Drawer/FilterDrawer.component';
import { Footer } from '../Core/Footer.component';
import { FullPageLoading } from './FullPageLoading.component';

export type AuthentificatedLayoutProps = React.PropsWithChildren<{}>;

export const AuthentificatedLayout: React.FC<AuthentificatedLayoutProps> = ({ children }) => {
    const { loading, session } = React.useContext(AuthContext);

    if (loading) return <FullPageLoading />;
    if (!session || !session.user) return <Navigate to="/sign-in" />;
    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer />
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
                <Appbar />

                <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
                    {children}
                    <Outlet />
                    <FilterDrawer />
                </Container>

                <Box sx={{ mt: 'auto' }}>
                    <Footer />
                </Box>
            </Main>
        </Box>
    );
};
