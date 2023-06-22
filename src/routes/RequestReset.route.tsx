import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components';
import { AuthContext, SnackbarContext } from '@/context';
import { supabase } from '@/supabase';
import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material';

export const RequestReset = () => {
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
                const { error } = await supabase.auth.api.resetPasswordForEmail(form.email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;

                showSnackbar({
                    message: 'Password reset requested',
                });
            } catch (error) {
                console.error(error);
                // @ts-ignore
                showSnackbar({ message: error.message || 'Authentification failed' });
            }
        },
    };

    return (
        <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
                <Card
                    sx={{
                        py: 3,
                        px: 4,
                    }}
                >
                    <Typography textAlign="center" variant="h4" fontWeight={600}>
                        Request Password Reset
                    </Typography>

                    <form onSubmit={formHandler.formSubmit}>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                            <TextField
                                sx={{
                                    mt: 3,
                                }}
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

                    {session && session.user && (
                        <Button component={Link} to="/dashboard" sx={{ width: '100%', mb: 2 }}>
                            Dashboard
                        </Button>
                    )}

                    <Button component={Link} to="/sign-in" sx={{ width: '100%', mb: 2 }}>
                        Wanna sign in
                    </Button>

                    <Button component={Link} to="/sign-up" sx={{ width: '100%' }}>
                        Don't have an account? Sign up...
                    </Button>
                </Card>
            </Grid>
        </Grid>
    );
};
