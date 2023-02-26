import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, alpha } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../../context';

export const DrawerItem: React.FC<{
  open: boolean;
  text: string;
  path: string;
  icon: JSX.Element;
  closeOnClick?: boolean;
}> = ({ open, text, path, icon, closeOnClick = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setShowDrawer } = React.useContext(StoreContext);
  const active = location.pathname === path;

  const handler = {
    onClick: () => {
      navigate(path, { replace: true });
      if (closeOnClick) setShowDrawer((prev) => !prev);
    },
  };

  return (
    <Tooltip key={text} title={open ? '' : text} placement="right">
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          sx={{
            mx: 1,
            height: 48,
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2,
            backgroundColor: (theme) => (active ? alpha(theme.palette.primary.main, 0.2) : 'transparent'),
            color: (theme) => (active ? theme.palette.primary.main : theme.palette.text.primary),
            borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            ':hover': {
              backgroundColor: (theme) =>
                active ? alpha(theme.palette.primary.main, 0.3) : theme.palette.action.hover,
            },
          }}
          onClick={handler.onClick}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
              color: 'inherit',
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};
