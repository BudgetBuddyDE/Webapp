import React from 'react';
import { Box, type BoxProps, alpha, styled } from '@mui/material';

export const IconBackground = styled(Box)<{
  backgroundColor?: React.CSSProperties['backgroundColor'];
}>(({ theme, backgroundColor }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: '40px',
  width: '40px',
  height: 'auto',
  aspectRatio: '1/1',
  backgroundColor: alpha(backgroundColor || theme.palette.primary.main, 0.2),
  color: backgroundColor || theme.palette.primary.main,
  borderRadius: `${Number(theme.shape.borderRadius) * 0.75}px`,
}));

export type TIconProps = BoxProps & {
  icon: React.ReactNode | JSX.Element;
  backgroundColor?: string;
};

export const Icon: React.FC<TIconProps> = (props) => {
  return <IconBackground {...props}>{props.icon}</IconBackground>;
};
