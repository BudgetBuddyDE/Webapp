import React from 'react';
import { LogoutRounded as LogoutIcon } from '@mui/icons-material';
import { Box, Button, type ButtonProps, useTheme, Divider, Typography, Chip } from '@mui/material';
import { useDrawerStore } from './Drawer.store';
import { useScreenSize, useWindowDimensions } from '@/hooks';
import { AuthService, useAuthContext } from '@/core/Auth';
import { UserAvatar } from '@/core/User';
import { useNavigate } from 'react-router-dom';

export type TDrawerProfileProps = {};

export const DrawerProfile: React.FC<TDrawerProfileProps> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const { open, toggle } = useDrawerStore();
  const { breakpoint } = useWindowDimensions();
  const { session, setSession } = useAuthContext();

  const handleSignOut = async () => {
    await AuthService.signOut((success) => {
      if (success) setSession(null);
    });
  };

  const handleClick = () => {
    if (!open && (breakpoint == 'sm' || breakpoint == 'xs')) {
      toggle();
    }
    navigate('/settings/profile');
  };

  if (!session) return null;
  return (
    <Box sx={{ mt: 'auto', backgroundColor: theme.palette.action.focus }}>
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
            transition: '100ms',
            display: screenSize === 'small' ? (open ? 'none' : 'flex') : open ? 'flex' : 'none',
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: theme.shape.borderRadius + 'px',
            px: 0.5,
            ':hover': {
              backgroundColor: theme.palette.action.hover,
              cursor: 'Pointer',
            },
          }}
          onClick={handleClick}
        >
          <UserAvatar />
          <Box sx={{ ml: '.5rem' }}>
            <Typography fontWeight="bold">
              {session.name} {session.surname}
            </Typography>
            <Chip label={session.role.name} variant="outlined" size="small" />
          </Box>
        </Box>
        <LogoutButton
          onClick={handleSignOut}
          sx={{
            ml: open ? 'auto' : '-.5rem',
            ':hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export const LogoutButton: React.FC<ButtonProps> = (props) => {
  const theme = useTheme();
  return (
    <Button
      {...props}
      sx={{
        minWidth: 48,
        width: 48,
        height: 48,
        minHeight: 48,
        p: 0,
        ...props.sx,
      }}
    >
      <LogoutIcon sx={{ color: theme.palette.text.primary }} />
    </Button>
  );
};
