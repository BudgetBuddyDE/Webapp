import { withUnauthentificatedLayout } from '@/components/Auth/Layout';
import { Card, PasswordInput } from '@/components/Base';
import { Button, Divider, Grid, Paper, Typography } from '@mui/material';
import { AppRegistrationRounded, HomeRounded, SendRounded } from '@mui/icons-material';
import { AppLogo } from '@/components/AppLogo.component';
import { AuthService, useAuthContext } from '@/components/Auth';
import { StackedIconButton } from '@/components/StackedIconButton.component';
import { useNavigate } from 'react-router-dom';
import { useSnackbarContext } from '@/components/Snackbar';
import React from 'react';
import { z } from 'zod';
import { CircularProgress } from '@/components/Loading';

const ZPassword = z
  .string()
  .min(8, 'The password needs to fullfill a minimum of 8 characters')
  .max(64);

const ResetPassword = () => {
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const { showSnackbar } = useSnackbarContext();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [form, setForm] = React.useState({
    pwd1: '',
    pwd2: '',
  });
  const searchParams = React.useMemo(
    () => new URLSearchParams(window.location.search),
    [window.location.search]
  );
  const otp: string | null = React.useMemo(() => {
    if (searchParams.has('otp')) {
      return searchParams.get('otp') as string;
    } else return null;
  }, [searchParams.get('otp')]);

  const validateOtp = React.useCallback(async () => {
    if (!otp) {
      setError(new Error('No OTP provided'));
      return;
    }
    setLoading(true);
    const [isValid, error] = await AuthService.validatePasswordResetOtp(otp);
    setLoading(false);
    if (error) return setError(error);
    if (!isValid) return setError(new Error('Invalid OTP'));
  }, [otp]);

  const handler = {
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (ZPassword.parse(form.pwd1) !== ZPassword.parse(form.pwd2)) {
          throw new Error('Passwords do not match');
        }

        const [updatedUser, error] = await AuthService.saveNewPassword(otp as string, form.pwd1);
        if (error) throw error;
        if (!updatedUser) throw new Error("Couldn't update your user");

        showSnackbar({ message: 'Your password was changed' });
        navigate('/sign-in');
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
      }
    },
  };

  React.useEffect(() => {
    if (!otp) {
      setError(new Error('No OTP provided'));
    }
    validateOtp();
  }, [otp]);

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
        {loading ? (
          <CircularProgress />
        ) : error != null ? (
          <Paper elevation={2} sx={{ mt: 1, p: 1 }}>
            <Typography variant="h6">Something wen't wrong</Typography>
            <Typography>{error.message}</Typography>
          </Paper>
        ) : (
          <React.Fragment>
            <Typography variant="h2" sx={{ my: 1 }}>
              Save new password
            </Typography>

            <form onSubmit={handler.onSubmit}>
              <PasswordInput
                formControlProps={{ sx: { mt: 2 } }}
                outlinedInputProps={{ name: 'pwd1', onChange: handler.onInputChange }}
              />

              <PasswordInput
                formControlProps={{ sx: { mt: 2 } }}
                outlinedInputProps={{ name: 'pwd2', onChange: handler.onInputChange }}
              />

              <Button type="submit" variant="contained" sx={{ mt: 2 }} endIcon={<SendRounded />}>
                Request reset
              </Button>
            </form>
          </React.Fragment>
        )}
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

export default withUnauthentificatedLayout(ResetPassword);
