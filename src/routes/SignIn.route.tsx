import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {AppRegistrationRounded, ExitToAppRounded, SendRounded} from '@mui/icons-material';
import {Link as RouterLink} from 'react-router-dom';
import {Box, Button, Divider, Link, Grid, TextField, Typography} from '@mui/material';
import {SocialSignInBtn, useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {Card, PasswordInput} from '@/components/Base';
import {AppLogo} from '@/components/AppLogo.component';
import {AppConfig} from '@/app.config.ts';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {pb} from '@/pocketbase.ts';
import {type RecordAuthResponse, type RecordModel} from 'pocketbase';
import {PocketBaseCollection} from '@budgetbuddyde/types';

const SignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {sessionUser, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [form, setForm] = React.useState<Record<string, string>>({});

  const handleSuccessfullLogin = (name: string) => {
    showSnackbar({message: `Welcome ${name}!`, action: <Button onClick={logout}>Sign-out</Button>});
    if (location.search) {
      const query = new URLSearchParams(location.search.substring(1));
      if (query.get('callbackUrl')) navigate(query.get('callbackUrl')!);
      return;
    }
    navigate('/');
  };

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    handleAuthProviderLogin: (response: RecordAuthResponse<RecordModel>) => {
      handleSuccessfullLogin(response.record.username);
    },
    formSubmit: React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
          const loginResponse = await pb
            .collection(PocketBaseCollection.USERS)
            .authWithPassword(form.email, form.password);
          handleSuccessfullLogin(loginResponse.record.username);
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: error instanceof Error ? error.message : 'Authentication failed',
          });
        }
      },
      [form, location],
    ),
  };

  React.useEffect(() => {
    return () => {
      setForm({});
    };
  }, []);

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
      <Box
        sx={{
          width: {xs: '90%', md: '40%', lg: '30%', xl: '25%'},
          maxWidth: '480px',
          mx: 'auto',
        }}>
        <Card sx={{py: 3, px: 4}}>
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

            <Typography variant={'h4'} textAlign={'center'} fontWeight={'bolder'} sx={{mt: 2}}>
              {sessionUser ? `Welcome ${sessionUser.username}!` : 'Sign in'}
            </Typography>
          </Box>

          <form onSubmit={formHandler.formSubmit}>
            <Grid container spacing={2} sx={{mt: 1}}>
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
                <PasswordInput outlinedInputProps={{onChange: formHandler.inputChange}} />

                <Link
                  tabIndex={-1}
                  variant="caption"
                  href="/request-password-reset"
                  sx={{textDecoration: 'none', mt: 0.5}}
                  component={Button}>
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendRounded />}
                sx={{mt: 1}}
                data-umami-event={'default-sign-in'}>
                Sign in
              </Button>
            </Box>
          </form>

          <Divider sx={{my: 2}}>or with</Divider>

          {Object.keys(AppConfig.authProvider).map((provider, idx, arr) => (
            <SocialSignInBtn
              key={provider}
              provider={provider}
              onAuthProviderResponse={formHandler.handleAuthProviderLogin}
              sx={{mb: idx !== arr.length - 1 ? 2 : 0}}
              data-umami-event={'social-sign-in'}
              data-umami-value={provider}
            />
          ))}

          <Divider sx={{my: 2}} data-umami-event={'sign-in-no-account'}>
            No account?
          </Divider>

          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*@ts-expect-error*/}
          <Button
            LinkComponent={RouterLink}
            to={'/sign-up'}
            variant={'contained'}
            size={'large'}
            startIcon={<AppRegistrationRounded />}
            fullWidth
            data-umami-event={'sign-in-redirect-register'}>
            Sign up
          </Button>
        </Card>
      </Box>
    </React.Fragment>
  );
};

export default withUnauthentificatedLayout(SignIn);
