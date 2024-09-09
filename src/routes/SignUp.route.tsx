import {PocketBaseCollection} from '@budgetbuddyde/types';
import {ExitToAppRounded, HomeRounded} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
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
import {useNavigate} from 'react-router-dom';

import {AppConfig} from '@/app.config';
import {AppLogo} from '@/components/AppLogo.component';
import {SocialSignInBtn, useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {PasswordInput} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {pb} from '@/pocketbase.ts';

const SignUp = () => {
  const navigate = useNavigate();
  const {sessionUser, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [form, setForm] = React.useState<Record<string, string>>({});

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  const formHandler = {
    inputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({...prev, [event.target.name]: event.target.value}));
    },
    handleAuthProviderLogin: (response: RecordAuthResponse<RecordModel>) => {
      showSnackbar({message: `Welcome ${response.record.username}!`});
      navigate('/');
    },
    formSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        const data = {
          username: `${form.name}_${form.surname}`.replaceAll(' ', '_').toLowerCase(),
          email: form.email,
          emailVisibility: false,
          password: form.password,
          passwordConfirm: form.password,
          name: form.name,
          surname: form.surname,
        };
        await pb.collection(PocketBaseCollection.USERS).create(data);

        pb.collection(PocketBaseCollection.USERS).requestVerification(form.email);

        await pb.collection(PocketBaseCollection.USERS).authWithPassword(form.email, form.password);

        showSnackbar({message: 'You have successfully registered and signed in!'});
        navigate('/');
      } catch (error) {
        console.error(error);
        showSnackbar({message: (error as Error).message || 'Registration failed'});
      }
    },
  };

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
        <Grid item xs={12} sm={12} md={4} lg={4} xl={3.5}>
          <MuiCard variant="outlined">
            <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
              <AppLogo style={{borderRadius: '5px'}} width={64} height={64} />
            </Box>

            <Typography variant="h4" textAlign={'center'}>
              Sign up
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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <TextField
                      variant="outlined"
                      id="name"
                      name="name"
                      placeholder="John"
                      onChange={formHandler.inputChange}
                      defaultValue={form.name || ''}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel htmlFor="surname">Surname</FormLabel>
                    <TextField
                      variant="outlined"
                      id="surname"
                      name="surname"
                      placeholder="Doe"
                      onChange={formHandler.inputChange}
                      defaultValue={form.surname || ''}
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel htmlFor="email">E-Mail</FormLabel>
                    <TextField
                      type="email"
                      variant="outlined"
                      id="email"
                      name="email"
                      placeholder="john.doe@budget-buddy.de"
                      onChange={formHandler.inputChange}
                      defaultValue={form.email || ''}
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <PasswordInput outlinedInputProps={{onChange: formHandler.inputChange}} />
                </Grid>

                <FormControlLabel
                  required
                  control={<Checkbox color="primary" />}
                  label={
                    <React.Fragment>
                      I accept the{' '}
                      <Link href={AppConfig.website + '/tos'} target="_blank">
                        Terms of Service
                      </Link>
                    </React.Fragment>
                  }
                  sx={{mx: 1, mt: 1}}
                />

                <Grid item xs={12}>
                  <Button type="submit" fullWidth variant="contained">
                    Sign up
                  </Button>

                  <Typography sx={{mt: 2, textAlign: 'center'}}>
                    Already have an account? <Link href="/sign-in">Sign in</Link>
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

export default withUnauthentificatedLayout(SignUp);
