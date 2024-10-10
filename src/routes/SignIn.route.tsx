import {AppRegistrationRounded, ExitToAppRounded, HomeRounded, SendRounded} from '@mui/icons-material';
import {Box, Button, Divider, Grid2 as Grid, Link, Stack, TextField, Typography} from '@mui/material';
import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Link as RouterLink} from 'react-router-dom';

import {AppConfig, type TAppConfig} from '@/app.config.ts';
import {AppLogo} from '@/components/AppLogo.component';
import {SocialSignInBtn, TSocialSignInHandlerProps, useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {Card, PasswordInput} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {AuthService} from '@/services';

const SignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {sessionUser, setSession, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [form, setForm] = React.useState<Record<string, string>>({});
  const authProviders = Object.keys(AppConfig.authProvider) as (keyof TAppConfig['authProvider'])[];

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSuccessfullLogin = (name: string) => {
    showSnackbar({message: `Welcome ${name}!`, action: <Button onClick={logout}>Sign-out</Button>});
    if (location.search) {
      const query = new URLSearchParams(location.search.substring(1));
      if (query.get('callbackUrl')) navigate(query.get('callbackUrl')!);
      return;
    }
    redirectToDashboard();
  };

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    handleAuthProviderLogin: (result: TSocialSignInHandlerProps) => {
      console.log(result);
    },
    formSubmit: React.useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const [session, err] = await AuthService.signInWithMail(form.email, form.password);
        if (err) {
          console.error(err);
          showSnackbar({message: err.message ?? 'Sign-in failed'});
        }

        if (session) {
          setSession(session);
          handleSuccessfullLogin(session.user.name);
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
        <Stack
          flexDirection={'row'}
          sx={{position: 'absolute', top: theme => theme.spacing(2), right: theme => theme.spacing(2)}}
          gap={AppConfig.baseSpacing}>
          <Button startIcon={<HomeRounded />} onClick={redirectToDashboard}>
            Dashboard
          </Button>

          <Button startIcon={<ExitToAppRounded />} onClick={logout}>
            Sign out
          </Button>
        </Stack>
      )}
      <Grid container justifyContent={'center'}>
        <Grid size={{xs: 12, md: 4, xl: 3.5}}>
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

              <Typography variant={'h5'} textAlign={'center'} fontWeight={'bolder'} sx={{mt: 2}}>
                {sessionUser ? `Welcome ${sessionUser.name}!` : 'Sign in'}
              </Typography>
            </Box>

            <form onSubmit={formHandler.formSubmit}>
              <Grid container spacing={AppConfig.baseSpacing} sx={{mt: 1}}>
                {authProviders.map(provider => (
                  <Grid key={provider} size={{xs: 6}}>
                    <SocialSignInBtn
                      key={provider}
                      provider={provider}
                      onAuthProviderResponse={formHandler.handleAuthProviderLogin}
                      data-umami-event={'social-sign-in'}
                      data-umami-value={provider}
                    />
                  </Grid>
                ))}

                {authProviders.length > 0 && (
                  <Grid size={{xs: 12}}>
                    <Divider>or with</Divider>
                  </Grid>
                )}

                <Grid size={{xs: 12}}>
                  <TextField
                    variant="outlined"
                    placeholder="Enter email"
                    type="email"
                    label="E-Mail"
                    name="email"
                    onChange={formHandler.inputChange}
                    defaultValue={form.email || ''}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid size={{xs: 12}}>
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
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withUnauthentificatedLayout(SignIn);
