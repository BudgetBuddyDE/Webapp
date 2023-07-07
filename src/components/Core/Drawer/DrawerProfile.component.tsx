import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/Profile/ProfileAvatar.component';
import { AuthContext } from '@/context/Auth.context';
import { StoreContext } from '@/context/Store.context';
import { useWindowDimensions } from '@/hook/useWindowDimensions.hook';
import { SupabaseClient } from '@/supabase';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps, Chip, Divider, Typography } from '@mui/material';

export type DrawerProfileProps = {
    open: boolean;
};

export const DrawerProfile: React.FC<DrawerProfileProps> = ({ open }) => {
    const navigate = useNavigate();
    const { breakpoint } = useWindowDimensions();
    const { session } = React.useContext(AuthContext);
    const { setShowDrawer, showDrawer } = React.useContext(StoreContext);

    const handleSignOut = async () => {
        await SupabaseClient().auth.signOut();
    };

    const handleClick = () => {
        navigate('/settings/profile');
        if (showDrawer && (breakpoint == 'sm' || breakpoint == 'xs')) {
            setShowDrawer(false);
        }
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
                    onClick={handleClick}
                >
                    {session && session.user && <ProfileAvatar />}
                    <Box sx={{ ml: '.5rem' }}>
                        <Typography fontWeight="bold">
                            {session && session.user && session.user.user_metadata.username}
                        </Typography>
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
