import { useTheme } from '@mui/material';
import React from 'react';

export type KeyboardBtnProps = React.PropsWithChildren<{ style?: React.CSSProperties }>;

export const KeyboardBtn: React.FC<KeyboardBtnProps> = ({ children, style }) => {
  const theme = useTheme();

  return (
    <kbd
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        padding: '0 2px',
        background: theme.palette.background.default,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07))',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${Number(theme.shape.borderRadius) / 2}px`,
        fontSize: '75%',
        ...style,
      }}
    >
      {children}
    </kbd>
  );
};
