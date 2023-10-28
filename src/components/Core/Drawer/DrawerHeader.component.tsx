import React from 'react';
import { StoreContext } from '@/context/Store.context';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Brand } from '../Brand.component';
import { DrawerHamburger } from './DrawerHamburger.component';

const StyledDrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  height: '67.5px',
  [theme.breakpoints.only('xs')]: {
    height: 'unset',
  },
}));

export type DrawerHeaderProps = {};

export const DrawerHeader: React.FC<DrawerHeaderProps> = () => {
  const { showDrawer, setShowDrawer } = React.useContext(StoreContext);

  return (
    <StyledDrawerHeader
      sx={{
        justifyContent: { xs: 'space-between', md: showDrawer ? 'space-between' : 'center' },
      }}
    >
      <Brand
        boxStyle={{
          display: { xs: 'flex', md: showDrawer ? 'flex' : 'none' },
          ml: 2,
        }}
      />
      <IconButton onClick={() => setShowDrawer((prev) => !prev)}>
        <DrawerHamburger />
      </IconButton>
    </StyledDrawerHeader>
  );
};
