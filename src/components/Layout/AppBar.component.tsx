import React from 'react';
import { LogoutRounded as LogoutIcon, SettingsRounded as SettingsIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { Brand } from '../Brand.component';
import { UserAvatar } from '@/core/User';
import { DrawerHamburger } from './Drawer/DrawerHamburger.component';
import { AuthService, useAuthContext } from '@/core/Auth';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';

export const AppBar = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthContext();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const MenuLinks = [
    { label: 'Website', href: AppConfig.website },
    { label: 'GitHub', href: AppConfig.repository },
  ];

  const ProfileMenu = [
    {
      icon: <SettingsIcon />,
      label: 'Settings',
      onClick: () => navigate('/settings/profile'),
    },
    {
      icon: <LogoutIcon />,
      label: 'Logout',
      onClick: async () => {
        await AuthService.signOut((success) => {
          if (success) setSession(null);
        });
      },
    },
  ];

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <MuiAppBar
      position="sticky"
      elevation={0}
      sx={{ border: 0, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop: Brand */}
          <Brand boxStyle={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />

          {/* Menu: Mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <DrawerHamburger size="large" />
          </Box>

          {/* Modile: Brand */}
          <Brand boxStyle={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }} />

          {/* Menu: Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, marginLeft: 'auto', marginRight: 2 }}>
            {MenuLinks.map((page) => (
              <Button
                key={page.label}
                href={page.href}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* Profile */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {/*FIXME: {session && session.user && <UserAvatar />} */}
                <UserAvatar />
              </IconButton>
            </Tooltip>
            <Menu
              elevation={0}
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {ProfileMenu.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    handleCloseUserMenu();
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
};
