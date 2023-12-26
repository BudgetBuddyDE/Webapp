import React from 'react';
import { AppRegistrationRounded, HomeRounded } from '@mui/icons-material';
import { Box, Button, Divider, Grid, Link, TextField } from '@mui/material';
import { AuthService, useAuthContext } from '@/core/Auth';
import { useSnackbarContext } from '@/core/Snackbar';
import { Card, PasswordInput } from '@/components/Base';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { AppLogo } from '@/components/AppLogo.component';
import { withUnauthentificatedLayout } from '@/core/Auth/Layout';
import { useNavigate } from 'react-router-dom';
import { type TSignInPayload, ZSignInPayload } from '@/types';

const SignIn = () => {
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
        const parsedForm = ZSignInPayload.safeParse(form);
        if (!parsedForm.success) throw new Error(parsedForm.error.message);
        const payload: TSignInPayload = parsedForm.data;

        const [session, error] = await AuthService.signIn(payload);
        if (error) throw error;
        if (!session) throw new Error('No session returned');
        setSession(session);
        showSnackbar({ message: 'Authentification successfull' });
        navigate('/');
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: error instanceof Error ? error.message : 'Authentification failed',
        });
      }
    },
  };

  React.useEffect(() => {
    return () => {
      setForm({});
    };
  }, []);

  return (
    <Box
      sx={{
        width: { xs: '90%', md: '40%', lg: '25%' },
        maxWidth: '480px',
        mx: 'auto',
      }}
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
            <Grid item xs={12} md={12}>
              <TextField
                variant="outlined"
                type="email"
                label="E-Mail"
                name="email"
                onChange={formHandler.inputChange}
                defaultValue={form.email || ''}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <PasswordInput outlinedInputProps={{ onChange: formHandler.inputChange }} />

              <Link
                tabIndex={-1}
                variant="caption"
                href="/request-password-reset"
                sx={{ textDecoration: 'none', mt: 0.5 }}
                component={Button}
              >
                Forgot password?
              </Link>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
              Sign in
            </Button>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={1} justifyContent="center">
          {session && (
            <Grid item xs={6} md={6} lg={6} xl={4}>
              <StackedIconButton
                size="large"
                startIcon={<HomeRounded />}
                sx={{ width: '100%' }}
                onClick={() => navigate('/')}
              >
                Dashboard
              </StackedIconButton>
            </Grid>
          )}
          <Grid item xs={6} md={6} lg={6} xl={4}>
            <StackedIconButton
              size="large"
              startIcon={<AppRegistrationRounded />}
              sx={{ width: '100%' }}
              onClick={() => {
                console.log('test');
                navigate('/sign-up');
              }}
            >
              Sign up
            </StackedIconButton>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default withUnauthentificatedLayout(SignIn);
