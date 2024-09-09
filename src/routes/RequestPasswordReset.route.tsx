import {PocketBaseCollection} from '@budgetbuddyde/types';
import {ExitToAppRounded} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Card as MuiCard,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {AppLogo} from '@/components/AppLogo.component';
import {useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {useSnackbarContext} from '@/components/Snackbar';
import {pb} from '@/pocketbase.ts';

const RequestPasswordReset = () => {
  const {sessionUser, logout} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handler = {
    onSubmit: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        setLoading(true);
        await pb.collection(PocketBaseCollection.USERS).requestPasswordReset(email);
        showSnackbar({message: 'Password reset email sent'});
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
          Request an password reset
        </Typography>

        <form onSubmit={handler.onSubmit}>
          <Grid container gap={AppConfig.baseSpacing}>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loading}>
                <FormLabel htmlFor="email">E-Mail</FormLabel>
                <TextField
                  type="email"
                  variant="outlined"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="outlined"
                fullWidth
                endIcon={loading ? <CircularProgress size={18} color="primary" /> : undefined}
                disabled={loading}>
                Request reset
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

export default withUnauthentificatedLayout(RequestPasswordReset);
