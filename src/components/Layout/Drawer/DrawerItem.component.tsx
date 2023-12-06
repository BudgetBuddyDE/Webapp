import React from 'react';
import {
  useTheme,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
} from '@mui/material';
import { useDrawerStore } from './Drawer.store';
import { useLocation, useNavigate } from 'react-router-dom';

export type TDrawerItemProps = {
  open: boolean;
  text: string;
  path: string;
  icon: JSX.Element;
  closeOnClick?: boolean;
};

export const DrawerItem: React.FC<TDrawerItemProps> = ({
  open,
  text,
  path,
  icon,
  closeOnClick = false,
}) => {
  const { toggle } = useDrawerStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const active: boolean = React.useMemo(() => {
    return location.pathname === path;
  }, [location, path]);

  const handler = {
    onClick: () => {
      if (closeOnClick) toggle();
      navigate(path);
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
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
            color: active ? theme.palette.primary.main : theme.palette.text.primary,
            borderRadius: `${theme.shape.borderRadius}px`,
            ':hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.3)
                : theme.palette.action.hover,
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
