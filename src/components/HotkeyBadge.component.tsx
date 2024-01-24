import React from 'react';
import { Badge, Box, type BadgeProps } from '@mui/material';
import { KeyboardCommandKeyRounded } from '@mui/icons-material';
import { useWindowDimensions } from '@/hooks';

export type THotKeyBadgeProps = { hotkey: string } & BadgeProps;

export const HotkeyBadge: React.FC<THotKeyBadgeProps> = ({ hotkey, ...props }) => {
  const { breakpoint } = useWindowDimensions();
  if (breakpoint === 'xs' || breakpoint === 'sm') {
    return <React.Fragment>{props.children}</React.Fragment>;
  }
  return (
    <Badge
      color="primary"
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <KeyboardCommandKeyRounded fontSize="inherit" />
          {hotkey.toUpperCase()}
        </Box>
      }
      {...props}
    >
      {props.children}
    </Badge>
  );
};
