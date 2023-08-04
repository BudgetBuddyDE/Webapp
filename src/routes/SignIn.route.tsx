import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';
import { Card } from '@/components/Base';
import { AppLogo } from '@/components/Core/App/AppLogo.component';
import { StackedIconButton } from '@/components/Core/StackedIconButton.component';
import { FailedLoginAttemptsDialog } from '@/components/Profile/FailedLoginAttemptsDialog.component';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { AuthService } from '@/services/Auth.service';
import { supabase } from '@/supabase';
import {
    AppRegistrationRounded,
    HomeRounded,
    LockResetRounded,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
} from '@mui/material';

const SignInRoute = () => {
    const navigate = useNavigate();
    const { session, setSession } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [form, setForm] = React.useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = React.useState(false);
    const [failedLogins, setFailedLogins] = React.useState<number>(0);

    const formHandler = {
        inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
        },
        formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            try {
                const values = Object.keys(form);
                ['email', 'password'].forEach((field) => {
                    if (!values.includes(field)) throw new Error('Provide an ' + field);
                });

                const {
                    data: { session },
                    error,
                } = await AuthService.signIn({
                    email: form.email,
                    password: form.password,
                });
                if (error) throw error;
                setSession(session);
                navigate('/dashboard', { replace: true });
                showSnackbar({
                    message: 'Authentification successfull',
                    action: <Button onClick={async () => await supabase.auth.signOut()}>Sign out</Button>,
                });
            } catch (error) {
                console.error(error);
                if (error instanceof Error && error.message === 'Invalid login credentials') {
                    setFailedLogins((prev) => (prev += 1));
                }

                showSnackbar({ message: error instanceof Error ? error.message : 'Authentification failed' });
            }
        },
    };

    return (
        <Box sx={{ width: { xs: '90%', md: '40%', lg: '25%' }, maxWidth: '480px', mx: 'auto' }}>
            <Card sx={{ py: 3, px: 4 }}>
                <Box display="flex" flexDirection="column">
                    <AppLogo sx={{ mx: 'auto' }} />
                </Box>

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
                        />

                        <FormControl
                            variant="outlined"
                            sx={{
                                mt: 3,
                            }}
                        >
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                onChange={formHandler.inputChange}
                                label="Password"
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            onMouseDown={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button disabled={failedLogins === 3} type="submit" variant="contained" sx={{ mt: 3 }}>
                            Sign in
                        </Button>
                    </Box>
                </form>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={1} justifyContent="center">
                    {session && session.user && (
                        <Grid item xs={6} md={6} lg={6} xl={4}>
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
                    <Grid item xs={6} md={6} lg={6} xl={4}>
                        <StackedIconButton
                            // @ts-ignore
                            component={Link}
                            to="/request-reset"
                            size="large"
                            startIcon={<LockResetRounded />}
                            sx={{ width: '100%' }}
                        >
                            Reset password?
                        </StackedIconButton>
                    </Grid>
                    <Grid item xs={6} md={6} lg={6} xl={4}>
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

            <FailedLoginAttemptsDialog
                open={failedLogins === AppConfig.signInDialogAfterAttempts}
                onClose={() => setFailedLogins(0)}
                onCancel={() => setFailedLogins(0)}
                onResetPassword={() => navigate('/request-reset')}
            />
        </Box>
    );
};

export default SignInRoute;
