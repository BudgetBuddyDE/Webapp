import React from 'react';
import { Link } from 'react-router-dom';
import { ActionPaper } from '@/components/Base/ActionPaper.component';
import { Footer } from '@/components/Core/Footer.component';
import { StackedIconButton } from '@/components/Core/StackedIconButton.component';
import { AuthContext } from '@/context/Auth.context';
import '@/style/main.css';
import { ExitToAppRounded, HomeRounded } from '@mui/icons-material';
import { Box, Grid, Typography, styled } from '@mui/material';

const Main = styled('main')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'inherit',
    justifyContent: 'center',
    alignItems: 'center',
}));

const PageNotFoundRoute = () => {
    const { session } = React.useContext(AuthContext);
    return (
        <Main>
            <ActionPaper
                sx={{
                    width: 'auto',
                    maxWidth: { xs: '90%', md: '450px' },
                    mt: 'auto',
                    px: 3,
                    py: 2,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h1">Ooops!</Typography>
                <Typography variant="h2" sx={{ mt: 1.5 }}>
                    Page Not Found
                </Typography>

                <Typography sx={{ my: 1 }}>The page you are looking for might have been removed or moved.</Typography>

                <Grid container spacing={1} sx={{ width: '60%', mx: 'auto', justifyContent: 'center' }}>
                    {session && session.user && (
                        <Grid item xs={6}>
                            <StackedIconButton
                                // @ts-ignore
                                component={Link}
                                to="/dashboard"
                                size="large"
                                startIcon={<HomeRounded />}
                                sx={{ width: '100%' }}
                            >
                                Dashboard
                            </StackedIconButton>
                        </Grid>
                    )}
                    <Grid item xs={6}>
                        <StackedIconButton
                            // @ts-ignore
                            component={Link}
                            to="/sign-in"
                            size="large"
                            startIcon={<ExitToAppRounded />}
                            sx={{ width: '100%' }}
                        >
                            Sign-in
                        </StackedIconButton>
                    </Grid>
                </Grid>
            </ActionPaper>

            <Box sx={{ mt: 'auto' }} children={<Footer />} />
        </Main>
    );
};

export default PageNotFoundRoute;
