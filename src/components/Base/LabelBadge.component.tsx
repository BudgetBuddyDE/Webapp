import React from 'react';
import {IconBackground, type TColorKeys} from '../Icon.component';
import {type BoxProps, Typography} from '@mui/material';

export type TLabelBadgeProps = {
  color?: TColorKeys;
  children: string | React.ReactNode;
  boxProps?: Omit<BoxProps, 'color'>;
};

export const LabelBadge: React.FC<TLabelBadgeProps> = ({color = 'primary', children, boxProps}) => {
  return (
    <IconBackground
      iconColor={color}
      {...boxProps}
      sx={{
        width: 'fit-content',
        aspectRatio: 'unset',
        px: 1,
        py: 0.25,
        ...boxProps?.sx,
      }}>
      {typeof children === 'string' ? <Typography>{children}</Typography> : children}
    </IconBackground>
  );
};
