import React from 'react';
import {
  ExitToAppRounded,
  HomeRounded,
  VisibilityRounded as VisibilityIcon,
  VisibilityOffRounded as VisibilityOffIcon,
} from '@mui/icons-material';
import { AuthService, useAuthContext } from '@/core/Auth';
import { useSnackbarContext } from '@/core/Snackbar';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { Card } from '@/components/Base';
import { AppLogo } from '@/components/AppLogo.component';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { withUnauthentificatedLayout } from '@/core/Auth/Layout';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';

const SignUp = () => {
  const navigate = useNavigate();
  const { session, setSession } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
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
        ['name', 'surname', 'email', 'password'].forEach((field) => {
          if (!values.includes(field)) throw new Error('Provide an ' + field);
        });

        const [user, error] = await AuthService.signUp({
          name: form.name,
          surname: form.surname,
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        if (!user) throw new Error('No user returned');
        setSession(session);
        showSnackbar({ message: 'Registration successfull! Sign in now...' });
        navigate('/sign-in');
      } catch (error) {
        console.error(error);
        showSnackbar({ message: (error as Error).message || 'Registration failed' });
      }
    },
  };

  return (
    <Box sx={{ width: { xs: '90%', md: '40%', lg: '25%' }, maxWidth: '480px', mx: 'auto' }}>
      <Card sx={{ py: 3, px: 4 }}>
        <Box display="flex" flexDirection="column">
          <AppLogo
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '5px',
            }}
            width={96}
            height={96}
          />
        </Box>

        <form onSubmit={formHandler.formSubmit}>
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  sx={{ mt: 3 }}
                  variant="outlined"
                  label="Name"
                  name="name"
                  onChange={formHandler.inputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  sx={{ mt: 3 }}
                  variant="outlined"
                  label="Surname"
                  name="surname"
                  onChange={formHandler.inputChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <TextField
              sx={{ mt: 3 }}
              variant="outlined"
              type="email"
              label="E-Mail"
              name="email"
              onChange={formHandler.inputChange}
              required
            />

            <FormControl variant="outlined" required sx={{ mt: 3 }}>
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
                      sx={{ mr: 0 }}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>

            <FormControlLabel
              required
              control={<Checkbox />}
              label={
                <React.Fragment>
                  I accept the{' '}
                  <Link href={AppConfig.website + '/tos'} target="_blank">
                    Terms of Service
                  </Link>
                </React.Fragment>
              }
              sx={{ mt: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
              Sign up
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={1} justifyContent="center">
          {session && (
            <Grid item xs={6} md={6} lg={6} xl={4}>
              <StackedIconButton
                onClick={() => navigate('/')}
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
              onClick={() => navigate('/sign-in')}
              size="large"
              startIcon={<ExitToAppRounded />}
              sx={{ width: '100%' }}
            >
              Sign-in
            </StackedIconButton>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default withUnauthentificatedLayout(SignUp);
