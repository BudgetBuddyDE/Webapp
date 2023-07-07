import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/Base';
import { StackedIconButton } from '@/components/Core/StackedIconButton.component';
import { AuthContext } from '@/context/Auth.context';
import { SnackbarContext } from '@/context/Snackbar.context';
import { AuthService } from '@/services/Auth.service';
import { supabase } from '@/supabase';
import {
    ExitToAppRounded,
    HomeRounded,
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
    Typography,
} from '@mui/material';

const SignUpRoute = () => {
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
                ['username', 'email', 'password'].forEach((field) => {
                    if (!values.includes(field)) throw new Error('Provide an ' + field);
                });

                const {
                    data: { user, session },
                    error,
                } = await AuthService.signUp({
                    email: form.email,
                    password: form.password,
                    metadata: { username: form.username, avatar: '' },
                });
                if (error || !user) throw error;
                setSession(session);
                navigate('/dashboard', { replace: true });
                showSnackbar({
                    message: 'Registration successfull',
                    action: <Button onClick={async () => await supabase.auth.signOut()}>Sign out</Button>,
                });
            } catch (error) {
                console.error(error);
                // @ts-ignore
                showSnackbar({ message: error.message || 'Registration failed' });
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
                        Sign Up
                    </Typography>

                    <form onSubmit={formHandler.formSubmit}>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                            <TextField
                                sx={{
                                    mt: 3,
                                }}
                                variant="outlined"
                                label="Username"
                                name="username"
                                onChange={formHandler.inputChange}
                            />

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
                                    label="Password"
                                />
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                                Sign up
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
                                to="/sign-in"
                                size="large"
                                startIcon={<ExitToAppRounded />}
                                sx={{ width: '100%' }}
                            >
                                Sign-in
                            </StackedIconButton>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    );
};

export default SignUpRoute;
