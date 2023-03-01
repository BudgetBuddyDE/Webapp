import { Logout as LogoutIcon, Menu as MenuIcon, MenuOpen as MenuOpenIcon } from '@mui/icons-material';
import { Box, Button, Chip, Divider, Fab, IconButton, List, Drawer as MuiDrawer, Typography } from '@mui/material';
import { CSSObject, Theme, styled } from '@mui/material/styles';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { DrawerLinks } from '../../../constants/drawer-items.constant';
import { AuthContext, StoreContext } from '../../../context';
import { useScreenSize } from '../../../hooks';
import { supabase } from '../../../supabase';
import { drawerWidth } from '../../../theme/default.theme';
import { ProfileAvatar } from '../../profile-avatar.component';
import { DrawerItem } from '../index';

export function getSavedSidebarState() {
  const saved = localStorage.getItem('bb.sidebar.show');
  if (saved === null) {
    return true;
  } else return saved === 'true';
}

export function saveSidebarState(state: boolean) {
  return localStorage.setItem('bb.sidebar.show', state.toString());
}

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

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

const Hamburger: React.FC<{ open: boolean }> = ({ open }) => {
  const screenSize = useScreenSize();
  if (screenSize === 'small') {
    return open ? <MenuIcon /> : <MenuOpenIcon />;
  } else return open ? <MenuOpenIcon /> : <MenuIcon />;
};

const Header = () => {
  const { showDrawer, setShowDrawer } = React.useContext(StoreContext);

  return (
    <DrawerHeader
      sx={{
        justifyContent: { xs: 'space-between', md: showDrawer ? 'space-between' : 'center' },
      }}
    >
      <Typography
        sx={{
          ml: '1.5rem',
          display: { xs: 'unset', md: showDrawer ? 'unset' : 'none' },
          fontWeight: 'bolder',
          fontSize: '1.2rem',
        }}
      >
        Budget-Buddy
      </Typography>
      <IconButton onClick={() => setShowDrawer((prev) => !prev)}>
        <Hamburger open={showDrawer} />
      </IconButton>
    </DrawerHeader>
  );
};

const DrawerItems: React.FC<{ open: boolean; closeOnClick?: boolean }> = ({ open, closeOnClick = false }) => {
  return (
    <>
      <Divider />
      <List>
        {DrawerLinks.map((link) => (
          <DrawerItem key={link.path} open={open} {...link} closeOnClick={closeOnClick} />
        ))}
      </List>
    </>
  );
};

const Profile: React.FC<{ open: boolean }> = ({ open }) => {
  const { session } = React.useContext(AuthContext);
  const {
    setTransactions,
    setSubscriptions,
    setBudget,
    setBudgetTransactions,
    setCategories,
    setPaymentMethods,
    setCategorySpendings,
    setMonthlyAvg,
  } = React.useContext(StoreContext);

  const handleSignOut = async () => {
    setTransactions({ type: 'CLEAR_DATA' });
    setSubscriptions({ type: 'CLEAR_DATA' });
    setBudget({ type: 'CLEAR_DATA' });
    setBudgetTransactions({ type: 'CLEAR_DATA' });
    setCategories({ type: 'CLEAR_DATA' });
    setPaymentMethods({ type: 'CLEAR_DATA' });
    setCategorySpendings({ type: 'CLEAR_DATA' });
    setMonthlyAvg({ type: 'CLEAR_DATA' });
    await supabase.auth.signOut();
  };

  return (
    <Box sx={{ mt: 'auto', backgroundColor: (theme) => theme.palette.action.focus }}>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
        }}
      >
        <Box
          sx={{
            display: open ? 'flex' : 'none',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {session && session.user && <ProfileAvatar user={session.user} />}
          <Box sx={{ ml: '.5rem' }}>
            <Typography fontWeight="bold">{session && session.user && session.user.user_metadata.username}</Typography>
            <Chip label="Basic" variant="outlined" size="small" />
          </Box>
        </Box>
        <Button
          sx={{
            minWidth: 48,
            width: 48,
            height: 48,
            minHeight: 48,
            ml: open ? 'auto' : '-.5rem',
            p: 0,
          }}
          onClick={handleSignOut}
        >
          <LogoutIcon sx={{ color: (theme) => theme.palette.text.primary }} />
        </Button>
      </Box>
    </Box>
  );
};

/**
 * We're inverting the showDrawer-value on mobile devices because it should be hidden by default on mobile devices for better UX
 */
export const Drawer = () => {
  const location = useLocation();
  const { showDrawer, setShowDrawer } = React.useContext(StoreContext);

  const toggleDrawer = () => setShowDrawer((prev) => !prev);

  // We don't want the drawer to show up on the sign-in, request-reset, reset-password or sign-up route
  if (
    location.pathname === '/sign-in' ||
    location.pathname === '/request-reset' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/sign-up'
  ) {
    return null;
  }
  return (
    <>
      {/* Mobile */}
      <MuiDrawer
        variant="temporary"
        open={!showDrawer} /*For information about the inverted value see comment above*/
        onClose={(ev, reason) => reason === 'backdropClick' && setShowDrawer(!showDrawer)}
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
        <Header />
        <DrawerItems open={!showDrawer} /*For information about the inverted value see comment above*/ closeOnClick />
        <Profile open={!showDrawer} />
      </MuiDrawer>

      {/* Desktop */}
      <StyledDrawer variant="permanent" open={showDrawer} sx={{ display: { xs: 'none', md: 'unset' } }}>
        <Header />
        <DrawerItems open={showDrawer} />
        <Profile open={showDrawer} />
      </StyledDrawer>

      <Fab
        size="large"
        onClick={toggleDrawer}
        aria-label="toggle-drawer"
        sx={{
          display: { xs: !showDrawer ? 'none' : 'flex', md: 'none' },
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Hamburger open={showDrawer} />
      </Fab>
    </>
  );
};
