import {AppRegistrationRounded, ExitToAppRounded, SendRounded} from '@mui/icons-material';
import {Box, Button, Divider, Grid, Link, TextField, Typography} from '@mui/material';
import {type RecordAuthResponse, type RecordModel} from 'pocketbase';
import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Link as RouterLink} from 'react-router-dom';

import {AppConfig} from '@/app.config.ts';
import {AppLogo} from '@/components/AppLogo.component';
import {SocialSignInBtn, useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {Card, PasswordInput} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {AuthService} from '@/services';

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
        const [result, error] = await AuthService.login(form.email, form.password);
        if (error) {
          console.error(error);
          showSnackbar({message: error instanceof Error ? error.message : 'Authentication failed'});
          return;
        }
        handleSuccessfullLogin(result.record.username);
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
      <Grid container justifyContent={'center'}>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={3}>
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
                {sessionUser ? `Welcome ${sessionUser.username}!` : 'Sign in'}
              </Typography>
            </Box>

            <form onSubmit={formHandler.formSubmit}>
              <Grid container spacing={AppConfig.baseSpacing} sx={{mt: 1}}>
                {Object.keys(AppConfig.authProvider).map(provider => (
                  <Grid key={provider} item xs={6}>
                    <SocialSignInBtn
                      key={provider}
                      provider={provider}
                      onAuthProviderResponse={formHandler.handleAuthProviderLogin}
                      data-umami-event={'social-sign-in'}
                      data-umami-value={provider}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Divider>or with</Divider>
                </Grid>

                <Grid item xs={12} md={12}>
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
