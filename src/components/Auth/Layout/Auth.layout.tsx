import {Box, Container, useTheme} from '@mui/material';
import React from 'react';

import {Main} from '@/components/Base';
import {CookieDisclaimer} from '@/components/CookieDisclaimer';
import {FilterDrawer} from '@/components/Filter';
import {AppBar, Footer} from '@/components/Layout';
import {Drawer} from '@/components/Layout/Drawer';

import {EnvironmentDisclaimer} from './EnvironmentDisclaimer.component';

export type TAuthLayout = React.PropsWithChildren;

export const AuthLayout: React.FC<TAuthLayout> = ({children}) => {
  const theme = useTheme();
  return (
    <Box sx={{display: 'flex'}}>
      <Drawer />
      <Main
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          height: '100vh',
          // backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
          // backgroundRepeat: 'no-repeat',
          // ...theme.applyStyles('dark', {
          //   backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
          // }),
        }}>
        <EnvironmentDisclaimer />

        <AppBar />

        <Container maxWidth="xl" sx={{mt: 2, mb: 4}}>
          {children}
        </Container>

        <Box sx={{mt: 'auto'}} children={<Footer />} />
        <CookieDisclaimer />
      </Main>

      <FilterDrawer />
    </Box>
  );
};
