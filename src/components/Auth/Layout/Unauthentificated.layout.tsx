import React from 'react';
import { Box } from '@mui/material';
import { Main } from './Main.component';
import { Footer } from '@/components/Layout';

export type TUnauthentificatedLayout = React.PropsWithChildren;

export const UnauthentificatedLayout: React.FC<TUnauthentificatedLayout> = ({ children }) => {
  return (
    <Main>
      <Box sx={{ width: '100%', mt: 'auto' }}>{children}</Box>
      <Box sx={{ mt: 'auto' }} children={<Footer />} />
    </Main>
  );
};

export function withUnauthentificatedLayout<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <UnauthentificatedLayout>
        <Component {...props} />
      </UnauthentificatedLayout>
    );
  };
}
