import { Logout as LogoutIcon, Settings as SettingsIcon } from '@mui/icons-material';
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
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, StoreContext } from '../../../context';
import { supabase } from '../../../supabase';
import { Hamburger } from '../../Core/Drawer';
import { ProfileAvatar } from '../../Core/ProfileAvatar.component';
import { Brand } from '../Brand';

export const AppBar = () => {
    const navigate = useNavigate();
    const { session } = React.useContext(AuthContext);
    const {
        showDrawer,
        setShowDrawer,
        setTransactions,
        setSubscriptions,
        setBudget,
        setBudgetTransactions,
        setCategories,
        setPaymentMethods,
        setCategorySpendings,
        setMonthlyAvg,
    } = React.useContext(StoreContext);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const MenuLinks = [
        { label: 'Website', href: 'https://budget-buddy.de' },
        { label: 'GitHub', href: 'https://github.com/BudgetBuddyDE/' },
    ];

    const ProfileMenu = [
        {
            icon: <SettingsIcon />,
            label: 'Settings',
            onClick: () => navigate('/settings'),
        },
        {
            icon: <LogoutIcon />,
            label: 'Logout',
            onClick: async () => {
                setTransactions({ type: 'CLEAR_DATA' });
                setSubscriptions({ type: 'CLEAR_DATA' });
                setBudget({ type: 'CLEAR_DATA' });
                setBudgetTransactions({ type: 'CLEAR_DATA' });
                setCategories({ type: 'CLEAR_DATA' });
                setPaymentMethods({ type: 'CLEAR_DATA' });
                setCategorySpendings({ type: 'CLEAR_DATA' });
                setMonthlyAvg({ type: 'CLEAR_DATA' });
                await supabase.auth.signOut();
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
                        <IconButton size="large" onClick={() => setShowDrawer((prev) => !prev)} color="inherit">
                            {/* <MenuIcon /> */}
                            <Hamburger open={showDrawer} />
                        </IconButton>
                    </Box>

                    {/* Modile: Brand */}
                    <Brand boxStyle={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }} />

                    {/* Menu: Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, marginLeft: 'auto', marginRight: 2 }}>
                        {MenuLinks.map((page) => (
                            <Button key={page.label} href={page.href} sx={{ my: 2, color: 'white', display: 'block' }}>
                                {page.label}
                            </Button>
                        ))}
                    </Box>

                    {/* Profile */}
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Profile">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {session && session.user && <ProfileAvatar />}
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
