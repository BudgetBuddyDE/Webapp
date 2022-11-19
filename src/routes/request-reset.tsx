import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ChangeEvent, FormEvent, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { supabase } from '../supabase';

export const RequestReset = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);
  const [form, setForm] = useState<Record<string, string>>({});

  const formHandler = {
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    formSubmit: async (event: FormEvent<HTMLFormElement>) => {
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

          <Button
            sx={{ width: '100%', mb: 2 }}
            onClick={() => navigate('/sign-in', { replace: true })}
          >
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
