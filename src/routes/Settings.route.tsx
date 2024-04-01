import React from 'react';
import {Card} from '@/components/Base';
import {PageHeader} from '@/components/Layout';
import {Box, Grid, Typography} from '@mui/material';
import {withAuthLayout} from '@/components/Auth/Layout';
import {AppInformation, EditProfile} from '@/components/Settings';
import {UserAvatar} from '@/components/User';
import {useAuthContext} from '@/components/Auth';

export type TSettingsRouteProps = {};

const SettingsRoute: React.FC<TSettingsRouteProps> = () => {
  const {session} = useAuthContext();

  return (
    <Grid container spacing={3}>
      <PageHeader title="Settings" />

      <Grid item xs={12} md={12} lg={12}>
        <Card sx={{p: 0}} className="test">
          <Card.Header
            sx={{
              position: 'relative',
              p: 0,
              aspectRatio: {xs: '6/2', md: '9/1'},
              backgroundSize: '100%',
              borderRadius: 'inherit',
            }}>
            <Box
              sx={{
                display: 'flex',
                m: {xs: 2, md: 4},
              }}>
              <UserAvatar
                sx={{
                  width: {xs: 64, md: 96},
                  height: {xs: 64, md: 96},
                }}
              />

              <Box sx={{mt: 'auto', mb: {xs: 0, md: 2}, ml: 1}}>
                <Typography variant="h2">
                  {session?.name} {session?.surname}
                </Typography>
                <Typography variant="body1" fontWeight="bolder">
                  {session?.uuid}
                </Typography>
              </Box>
            </Box>
          </Card.Header>
        </Card>
      </Grid>

      <Grid container item xs={12} md={4} lg={4} xl={3} order={{xs: 1, md: 0}}>
        <Grid item xs={12} md={12} lg={12}>
          <AppInformation />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={8} lg={8} xl={9} order={{xs: 0, md: 1}}>
        <Grid item xs={12} md={8} lg={6} xl={6}>
          <EditProfile />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withAuthLayout(SettingsRoute);
