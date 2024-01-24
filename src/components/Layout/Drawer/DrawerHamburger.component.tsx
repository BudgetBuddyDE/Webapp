import React from 'react';
import { MenuRounded as MenuIcon, MenuOpenRounded as MenuOpenIcon } from '@mui/icons-material';
import { IconButton, type IconButtonProps } from '@mui/material';
import { useScreenSize } from '@/hooks';
import { useDrawerStore } from './Drawer.store';
import { HotkeyBadge } from '@/components/HotkeyBadge.component';

export type TDrawerHeaderProps = IconButtonProps;

export const DrawerHamburger: React.FC<TDrawerHeaderProps> = ({ ...iconButtonProps }) => {
  const screenSize = useScreenSize();
  const { open, toggle } = useDrawerStore();
  return (
    <HotkeyBadge hotkey="b">
      <IconButton onClick={() => toggle()} {...iconButtonProps}>
        <Icon open={open} screenSize={screenSize} />
      </IconButton>
    </HotkeyBadge>
  );
};

const Icon: React.FC<{ open: boolean; screenSize: ReturnType<typeof useScreenSize> }> = ({
  open,
  screenSize,
}) => {
  if (screenSize === 'small') {
    return open ? <MenuIcon /> : <MenuOpenIcon />;
  } else return open ? <MenuOpenIcon /> : <MenuIcon />;
};
