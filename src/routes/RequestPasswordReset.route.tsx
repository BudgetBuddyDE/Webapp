import { withUnauthentificatedLayout } from '@/components/Auth/Layout';
import { Card } from '@/components/Base';
import { Button, CircularProgress, Divider, Grid, TextField, Typography } from '@mui/material';
import { AppRegistrationRounded, HomeRounded, SendRounded } from '@mui/icons-material';
import { AppLogo } from '@/components/AppLogo.component';
import { AuthService, useAuthContext } from '@/components/Auth';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { useNavigate } from 'react-router-dom';
import { useSnackbarContext } from '@/components/Snackbar';
import React from 'react';
import { ZEmail } from '@budgetbuddyde/types';

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handler = {
    onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        setLoading(true);
        const emailValidationResult = ZEmail.safeParse(email);
        if (!emailValidationResult.success) {
          throw new Error(emailValidationResult.error.message);
        }
        const [resetToken, error] = await AuthService.requestPasswordReset(email);
        if (error) throw error;
        if (process.env.NODE_ENV === 'development') console.log(resetToken);

        showSnackbar({ message: 'Password reset email sent' });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: (error as Error).message,
          action: (
            <Button size="small" onClick={() => handler.onSubmit(e)}>
              Retry
            </Button>
          ),
        });
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <Card
      sx={{
        width: { xs: '90%', md: '40%', lg: '30%', xl: '25%' },
        maxWidth: '480px',
        mx: 'auto',
        px: 4,
        py: 2,
        textAlign: 'center',
      }}
    >
      <Card.Header>
        <AppLogo
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '5px',
          }}
          width={96}
          height={96}
        />
      </Card.Header>
      <Card.Body>
        <Typography variant="h2" sx={{ my: 1 }}>
          Reset Password
        </Typography>

        <form onSubmit={handler.onSubmit}>
          <TextField
            id="email"
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            required
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            endIcon={loading ? <CircularProgress size={18} color="primary" /> : <SendRounded />}
            disabled={loading}
          >
            Request reset
          </Button>
        </form>
      </Card.Body>

      <Card.Footer>
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
      </Card.Footer>
    </Card>
  );
};

export default withUnauthentificatedLayout(RequestPasswordReset);
