import React from 'react';
import { ExitToAppRounded, HomeRounded } from '@mui/icons-material';
import { AuthService, useAuthContext } from '@/components/Auth';
import { useSnackbarContext } from '@/components/Snackbar';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  TextField,
} from '@mui/material';
import { Card, PasswordInput } from '@/components/Base';
import { AppLogo } from '@/components/AppLogo.component';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { withUnauthentificatedLayout } from '@/components/Auth/Layout';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';
import { type TSignUpPayload, ZSignUpPayload } from '@budgetbuddyde/types';

const SignUp = () => {
  const navigate = useNavigate();
  const { session, setSession } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [form, setForm] = React.useState<Record<string, string>>({});

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const parsedForm = ZSignUpPayload.safeParse(form);
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TSignUpPayload = parsedForm.data;

        const [user, error] = await AuthService.signUp(payload);
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
    <Box
      sx={{ width: { xs: '90%', md: '40%', lg: '30%', xl: '25%' }, maxWidth: '480px', mx: 'auto' }}
    >
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
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
                variant="outlined"
                label="Surname"
                name="surname"
                onChange={formHandler.inputChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                variant="outlined"
                type="email"
                label="E-Mail"
                name="email"
                onChange={formHandler.inputChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <PasswordInput outlinedInputProps={{ onChange: formHandler.inputChange }} />
            </Grid>

            <Grid item xs={12} md={12}>
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
            </Grid>
          </Grid>
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
