import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { DrawerLinks } from '../constants/drawer-items.constant';
import { StoreContext } from '../context/store.context';
import { drawerWidth } from '../theme/default.theme';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AuthContext } from '../context/auth.context';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from '../supabase';
import { useScreenSize } from '../hooks/useScreenSize.hook';

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

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
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
  })
);

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
        justifyContent: { xs: 'flex-end', md: showDrawer ? 'flex-end' : 'center' },
      }}
    >
      <IconButton onClick={() => setShowDrawer((prev) => !prev)}>
        <Hamburger open={showDrawer} />
      </IconButton>
    </DrawerHeader>
  );
};

const DrawerItems: React.FC<{ open: boolean; closeOnClick?: boolean }> = ({
  open,
  closeOnClick = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setShowDrawer } = React.useContext(StoreContext);
  return (
    <>
      <Divider />
      <List>
        {DrawerLinks.map((link) => (
          <Tooltip key={link.text} title={open ? '' : link.text} placement="right">
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  mx: '.5rem',
                  height: 48,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: (theme) =>
                    location.pathname === link.path ? theme.palette.action.focus : 'transparent',
                  borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                }}
                onClick={() => {
                  navigate(link.path, { replace: true });
                  if (closeOnClick) setShowDrawer((prev) => !prev);
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </>
  );
};

const Profile: React.FC<{ open: boolean }> = ({ open }) => {
  const { session } = React.useContext(AuthContext);

  const handleSignOut = async () => {
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
          <Avatar variant="rounded">
            {session &&
              session.user &&
              session.user.email &&
              session.user.email.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: '.5rem' }}>
            <Typography fontWeight="bold">
              {session && session.user && session.user.email && session.user.email.split('@')[0]}
            </Typography>
            <Typography>Basic</Typography>
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
const Drawer = () => {
  const location = useLocation();
  const { showDrawer, setShowDrawer } = React.useContext(StoreContext);

  const toggleDrawer = () => setShowDrawer((prev) => !prev);

  // We don't want the drawer to show up on the sign-in or sign-up route
  if (location.pathname === '/sign-in' || location.pathname === '/sign-up') return null;
  return (
    <>
      {/* Mobile */}
      <MuiDrawer
        variant="temporary"
        open={!showDrawer} /*For information about the inverted value see comment above*/
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth * 1.1 },
        }}
      >
        <Header />
        <DrawerItems
          open={!showDrawer} /*For information about the inverted value see comment above*/
          closeOnClick
        />
        <Profile open={!showDrawer} />
      </MuiDrawer>

      {/* Desktop */}
      <StyledDrawer
        variant="permanent"
        open={showDrawer}
        sx={{ display: { xs: 'none', md: 'unset' } }}
      >
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

export default Drawer;
