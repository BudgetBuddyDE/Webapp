import { Logout as LogoutIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps, Chip, Divider, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, StoreContext } from '../../../context';
import { supabase } from '../../../supabase';
import { ProfileAvatar } from '../ProfileAvatar.component';

export type DrawerProfileProps = {
  open: boolean;
};

export const DrawerProfile: React.FC<DrawerProfileProps> = ({ open }) => {
  const navigate = useNavigate();
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
            transition: '100ms',
            display: open ? 'flex' : 'none',
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: (theme) => theme.shape.borderRadius + 'px',
            ':hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
              cursor: 'Pointer',
            },
          }}
          onClick={() => navigate('/settings/profile')}
        >
          {session && session.user && <ProfileAvatar />}
          <Box sx={{ ml: '.5rem' }}>
            <Typography fontWeight="bold">{session && session.user && session.user.user_metadata.username}</Typography>
            <Chip label="Basic" variant="outlined" size="small" />
          </Box>
        </Box>
        <LogoutButton onClick={handleSignOut} sx={{ ml: open ? 'auto' : '-.5rem' }} />
      </Box>
    </Box>
  );
};

export const LogoutButton: React.FC<ButtonProps> = (props) => {
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
      <LogoutIcon sx={{ color: (theme) => theme.palette.text.primary }} />
    </Button>
  );
};
