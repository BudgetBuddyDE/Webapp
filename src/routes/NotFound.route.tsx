import {ExitToAppRounded} from '@mui/icons-material';
import {Button, Grid, Card as MuiCard, CardContent as MuiCardContent, Stack, Typography} from '@mui/material';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {withUnauthentificatedLayout} from '@/components/Auth/Layout';
import {useDocumentTitle} from '@/hooks';

import {DashboardViewIconMapping} from './Dashboard';

const PageNotFound = () => {
  useDocumentTitle('Page not Found', true);
  const {sessionUser} = useAuthContext();
  return (
    <Grid container justifyContent={'center'}>
      <Grid item xs={12} sm={12} md={4} lg={4} xl={3}>
        <MuiCard variant="outlined">
          <MuiCardContent sx={{textAlign: 'center'}}>
            <Typography variant="h2">Ooops!</Typography>
            <Typography variant="h3" sx={{mt: 1.5, fontWeight: '600'}}>
              Page Not Found
            </Typography>
            <Typography variant="subtitle1" sx={{my: 1}}>
              The page you are looking for might have been removed or moved.
            </Typography>

            <Stack flexDirection={'row'} gap={AppConfig.baseSpacing}>
              {sessionUser && (
                <Button
                  variant="outlined"
                  href="/dashboard"
                  startIcon={DashboardViewIconMapping['overview']}
                  sx={{flex: 1}}>
                  Go to Dashboard
                </Button>
              )}

              <Button variant="outlined" href="/sign-in" startIcon={<ExitToAppRounded />} sx={{flex: 1}}>
                Sign in
              </Button>
            </Stack>
          </MuiCardContent>
        </MuiCard>
      </Grid>
    </Grid>
  );
};

export default withUnauthentificatedLayout(PageNotFound);
