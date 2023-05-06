import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '../components';
import { SnackbarContext } from '../context';
import { supabase } from '../supabase';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [hash] = React.useState(window.location.hash);
  const [form, setForm] = React.useState<Record<string, string>>({});

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        if (form.password1 !== form.password2) throw new Error('Passwords are not equal');

        const { error } = await supabase.auth.api.updateUser(hashFromString(hash).access_token, {
          password: form.password1,
        });
        if (error) throw error;

        navigate('/sign-in', { replace: true });
        showSnackbar({
          message: 'New password saved',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        showSnackbar({ message: error.message || 'Password reset failed' });
      }
    },
  };

  if (!hash) return <Navigate to="/request-reset" />;
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
            Reset Password
          </Typography>

          <form onSubmit={formHandler.formSubmit}>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                sx={{
                  mt: 3,
                }}
                variant="outlined"
                type="password"
                label="Password"
                name="password1"
                onChange={formHandler.inputChange}
                required
              />

              <TextField
                sx={{
                  mt: 3,
                }}
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

          <Button sx={{ width: '100%', mb: 2 }} onClick={() => navigate('/reset-password', { replace: true })}>
            Wanna sign in?
          </Button>

          <Button sx={{ width: '100%' }} onClick={() => navigate('/sign-up', { replace: true })}>
            Don't have an account? Sign up...
          </Button>
        </Card>
      </Grid>
    </Grid>
  );
};

function hashFromString(hash: string) {
  return Object.fromEntries(
    hash
      .substring(1)
      .split('&')
      .map((param) => param.split('='))
  );
}
