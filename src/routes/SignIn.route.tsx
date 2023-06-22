import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components';
import { AuthContext, SnackbarContext } from '@/context';
import { AuthService } from '@/services';
import { supabase } from '@/supabase';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
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
    Typography,
} from '@mui/material';

export const SignIn = () => {
    const navigate = useNavigate();
    const { session, setSession } = React.useContext(AuthContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const [form, setForm] = React.useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = React.useState(false);

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

                const { session, error } = await AuthService.signIn({
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
                        Sign In
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
                            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                                Sign in
                            </Button>
                        </Box>
                    </form>

                    <Divider sx={{ my: 3 }} />

                    {session && session.user && (
                        <Button component={Link} to="/dashboard" sx={{ width: '100%', mb: 2 }}>
                            Dashboard
                        </Button>
                    )}

                    <Button component={Link} to="/request-reset" sx={{ width: '100%', mb: 2 }}>
                        Reset password?
                    </Button>

                    <Button component={Link} to="/sign-up" sx={{ width: '100%' }}>
                        Don't have an account? Sign up...
                    </Button>
                </Card>
            </Grid>
        </Grid>
    );
};
