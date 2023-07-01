import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Base';
import { StackedIconButton } from '@/components/Core/StackedIconButton.component';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { SupabaseClient } from '@/supabase';
import { AppRegistrationRounded, ExitToAppRounded, HomeRounded } from '@mui/icons-material';
import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material';

const RequestPasswordResetRoute = () => {
    const { session } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [form, setForm] = React.useState<Record<string, string>>({});

    const formHandler = {
        inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            try {
                if (!form.email) {
                    throw new Error('Provide an email');
                }
                const redirectLocation = `${window.location.origin}/reset-password`;
                const { error } = await SupabaseClient().auth.resetPasswordForEmail(form.email, {
                    redirectTo: redirectLocation,
                });
                if (error) throw error;
                showSnackbar({ message: 'Email for password reset was send' });
            } catch (error) {
                console.error(error);
                showSnackbar({ message: error instanceof Error ? error.message : "Something wen't wrong" });
            }
        },
    };

    return (
        <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
                <Card sx={{ py: 3, px: 4 }}>
                    <Typography textAlign="center" variant="h4" fontWeight={600}>
                        Request Password Reset
                    </Typography>

                    <form onSubmit={formHandler.formSubmit}>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                            <TextField
                                sx={{ mt: 3 }}
                                variant="outlined"
                                type="email"
                                label="E-Mail"
                                name="email"
                                onChange={formHandler.inputChange}
                                required
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                                Request reset
                            </Button>
                        </Box>
                    </form>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={1} justifyContent="center">
                        {session && session.user && (
                            <Grid item xs={6} md={4}>
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
                        <Grid item xs={6} md={4}>
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
                        <Grid item xs={6} md={4}>
                            <StackedIconButton
                                // @ts-ignore
                                component={Link}
                                to="/sign-up"
                                size="large"
                                startIcon={<AppRegistrationRounded />}
                                sx={{ width: '100%' }}
                            >
                                Sign up
                            </StackedIconButton>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    );
};

export default RequestPasswordResetRoute;
