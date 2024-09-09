import {ExitToAppRounded, HomeRounded} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Link,
  Card as MuiCard,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {type RecordAuthResponse, type RecordModel} from 'pocketbase';
import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {AppConfig} from '@/app.config.ts';
import {AppLogo} from '@/components/AppLogo.component';
import {SocialSignInBtn, useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {PasswordInput} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {AuthService} from '@/services';

const SignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {sessionUser, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [form, setForm] = React.useState<Record<string, string>>({});

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
      <Grid container justifyContent={'center'} gap={AppConfig.baseSpacing}>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={3.5}>
          <MuiCard variant="outlined">
            <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
              <AppLogo style={{borderRadius: '5px'}} width={64} height={64} />
            </Box>

            <Typography variant="h4" textAlign={'center'}>
              {sessionUser ? `Welcome ${sessionUser.name}!` : 'Sign in'}
            </Typography>

            <form onSubmit={formHandler.formSubmit}>
              <Grid container spacing={AppConfig.baseSpacing} sx={{mt: 1}}>
                {Object.keys(AppConfig.authProvider).map(provider => (
                  <Grid key={provider} item xs={6}>
                    <SocialSignInBtn
                      key={provider}
                      variant="outlined"
                      provider={provider}
                      onAuthProviderResponse={formHandler.handleAuthProviderLogin}
                      data-umami-event={'social-sign-in'}
                      data-umami-value={provider}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Divider>or</Divider>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel htmlFor="email">E-Mail</FormLabel>
                    <TextField
                      type="email"
                      variant="outlined"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      onChange={formHandler.inputChange}
                      defaultValue={form.email || ''}
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <PasswordInput outlinedInputProps={{onChange: formHandler.inputChange}} showForgotPassword />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" fullWidth variant="contained">
                    Sign in
                  </Button>

                  <Typography sx={{mt: 2, textAlign: 'center'}}>
                    Don't have an account? <Link href="/sign-up">Sign up</Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </MuiCard>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withUnauthentificatedLayout(SignIn);
