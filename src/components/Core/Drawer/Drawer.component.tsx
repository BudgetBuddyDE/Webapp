import React from 'react';
import { StoreContext } from '@/context/Store.context';
import { drawerWidth } from '@/style/theme/default.theme';
import { Divider, List, Drawer as MuiDrawer, styled } from '@mui/material';
import type { CSSObject, Theme } from '@mui/material';
import { DrawerHeader } from './DrawerHeader.component';
import { DrawerItem } from './DrawerItem.component';
import { DrawerLinks } from './DrawerItems';
import { DrawerProfile } from './DrawerProfile.component';

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

/**
 * We're inverting the showDrawer-value on mobile devices because it should be hidden by default on mobile devices for better UX
 */
export const Drawer = () => {
  const { showDrawer, setShowDrawer } = React.useContext(StoreContext);
  const DrawerItems: React.FC<{ open: boolean; closeOnClick?: boolean }> = ({ open, closeOnClick = false }) => {
    return (
      <React.Fragment>
        <Divider />
        <List>
          {DrawerLinks.map((link) => (
            <DrawerItem key={link.path} open={open} {...link} closeOnClick={closeOnClick} />
          ))}
        </List>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {/* Mobile */}
      <MuiDrawer
        variant="temporary"
        open={!showDrawer} /*For information about the inverted value see comment above*/
        onClose={(_ev, reason) => reason === 'backdropClick' && setShowDrawer(!showDrawer)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: '80%' },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            backgroundColor: '#001E3C',
          },
        }}
      >
        <DrawerHeader />
        <DrawerItems open={!showDrawer} /*For information about the inverted value see comment above*/ closeOnClick />
        <DrawerProfile open={!showDrawer} />
      </MuiDrawer>

      {/* Desktop */}
      <StyledDrawer variant="permanent" open={showDrawer} sx={{ display: { xs: 'none', md: 'unset' } }}>
        <DrawerHeader />
        <DrawerItems open={showDrawer} />
        <DrawerProfile open={showDrawer} />
      </StyledDrawer>
    </React.Fragment>
  );
};
