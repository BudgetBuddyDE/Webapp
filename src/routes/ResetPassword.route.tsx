import {PocketBaseCollection} from '@budgetbuddyde/types';
import {ExitToAppRounded} from '@mui/icons-material';
import {Box, Button, CircularProgress, Divider, Grid, Card as MuiCard, Stack, Typography} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {z} from 'zod';

import {AppConfig} from '@/app.config';
import {AppLogo} from '@/components/AppLogo.component';
import {useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {PasswordInput} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {pb} from '@/pocketbase';

const ZPassword = z.string().min(8, 'The password needs to fullfill a minimum of 8 characters').max(64);

const ResetPassword = () => {
  const navigate = useNavigate();
  const {sessionUser, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    pwd1: '',
    pwd2: '',
  });
  const searchParams = React.useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
  const otp: string | null = React.useMemo(() => {
    if (searchParams.has('code')) {
      return searchParams.get('code') as string;
    } else return null;
  }, [searchParams]);
  const handler = {
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({...prev, [e.target.name]: e.target.value}));
    },
    onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        if (!otp) throw new Error('No OTP provided');
        if (ZPassword.parse(form.pwd1) !== ZPassword.parse(form.pwd2)) {
          throw new Error('Passwords do not match');
        }
        setLoading(true);

        await pb.collection(PocketBaseCollection.USERS).confirmPasswordReset(otp, form.pwd1, form.pwd2);
        showSnackbar({message: 'Your password has been reset. Please sign in with your new password.'});
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
      setLoading(false);
    },
  };

  return (
    <React.Fragment>
      {sessionUser && (
        <Button
          sx={{position: 'absolute', top: theme => theme.spacing(2), right: theme => theme.spacing(2)}}
          startIcon={<ExitToAppRounded />}
          onClick={logout}>
          Sign out
        </Button>
      )}
      <MuiCard
        variant="outlined"
        sx={{
          width: {xs: '90%', md: '40%', lg: '30%', xl: '25%'},
          maxWidth: '480px',
          mx: 'auto',
        }}>
        <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
          <AppLogo style={{borderRadius: '5px'}} width={64} height={64} />
        </Box>

        <Typography variant="h4" textAlign={'center'}>
          Reset your password
        </Typography>

        <form onSubmit={handler.onSubmit}>
          <Grid container gap={AppConfig.baseSpacing}>
            <Grid item xs={12}>
              <PasswordInput outlinedInputProps={{name: 'pwd1', onChange: handler.onInputChange}} />
            </Grid>

            <Grid item xs={12}>
              <PasswordInput outlinedInputProps={{name: 'pwd2', onChange: handler.onInputChange}} />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="outlined"
                fullWidth
                endIcon={loading ? <CircularProgress size={18} color="primary" /> : undefined}
                disabled={loading}>
                Save new password
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider>or</Divider>
            </Grid>

            <Grid item xs={12}>
              <Stack flexDirection={'row'} gap={AppConfig.baseSpacing}>
                <Button variant="outlined" href="/sign-in" sx={{flex: 1}}>
                  Sign in
                </Button>
                <Button variant="outlined" href="/sign-up" sx={{flex: 1}}>
                  Sign up
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MuiCard>
    </React.Fragment>
  );
};

export default withUnauthentificatedLayout(ResetPassword);
