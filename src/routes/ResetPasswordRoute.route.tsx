import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/Base';
import { AppLogo, StackedIconButton } from '@/components/Core';
import { AuthContext, SnackbarContext } from '@/context';
import { supabase } from '@/supabase';
import { AppRegistrationRounded, ExitToAppRounded, HomeRounded } from '@mui/icons-material';
import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material';

// function hashFromString(hash: string) {
//     return Object.fromEntries(
//         hash
//             .substring(1)
//             .split('&')
//             .map((param) => param.split('='))
//     );
// }

const ResetPasswordRoute = () => {
  const navigate = useNavigate();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  // const [hash] = React.useState(window.location.hash); // FIXME: Use const hash = window.location.hash;
  const [form, setForm] = React.useState<Record<string, string>>({});

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        if (!form.password1) throw new Error('You have to provide a new password');
        if (form.password1 !== form.password2) throw new Error('Passwords are not equal');

        const { data, error } = await supabase.auth.updateUser({ password: form.password1 });
        if (error) throw error;
        console.log(data);
        // const { error } = await supabase.auth.api.updateUser(hashFromString(hash).access_token, {
        //     password: form.password1,
        // });
        // if (error) throw error;

        navigate('/sign-in');
        showSnackbar({ message: 'Your password was saved' });
      } catch (error) {
        console.error(error);
        showSnackbar({ message: error instanceof Error ? error.message : "Could'nt reset the password" });
      }
    },
  };

  // if (!hash) return <Navigate to="/request-reset" />;
  return (
    <Box sx={{ width: { xs: '90%', md: '40%', lg: '25%' }, maxWidth: '480px', mx: 'auto' }}>
      <Card sx={{ py: 3, px: 4 }}>
        <Box display="flex" flexDirection="column">
          <AppLogo sx={{ mx: 'auto' }} />
          <Typography textAlign="center" variant="h4" fontWeight={600}>
            Reset Password
          </Typography>
        </Box>

        <form onSubmit={formHandler.formSubmit}>
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              sx={{ mt: 3 }}
              variant="outlined"
              type="password"
              label="Password"
              name="password1"
              onChange={formHandler.inputChange}
              required
            />

            <TextField
              sx={{ mt: 3 }}
              variant="outlined"
              type="password"
              label="Re-enter Password"
              name="password2"
              onChange={formHandler.inputChange}
              required
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
              Reset
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
                // @ts-ignore
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
              // @ts-ignore
              to="/sign-in"
              size="large"
              startIcon={<ExitToAppRounded />}
              sx={{ width: '100%' }}
            >
              Sign-in
            </StackedIconButton>
          </Grid>
          <Grid item xs={6} md={6} lg={6} xl={4}>
            <StackedIconButton
              // @ts-ignore
              component={Link}
              // @ts-ignore
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
    </Box>
  );
};

export default ResetPasswordRoute;
