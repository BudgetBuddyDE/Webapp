import { Box, BoxProps, alpha, styled } from '@mui/material';
import React from 'react';

export const IconBackground = styled(Box)<{
    backgroundColor?: React.CSSProperties['backgroundColor'];
}>(({ theme, backgroundColor }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '40px',
    width: '40px',
    minHeight: '40px',
    height: '40px',
    backgroundColor: alpha(backgroundColor || theme.palette.primary.main, 0.2),
    color: backgroundColor || theme.palette.primary.main,
    borderRadius: `${Number(theme.shape.borderRadius) * 0.75}px`,
}));

export interface IconProps extends BoxProps {
    icon: React.ReactNode | JSX.Element;
    backgroundColor?: string;
}

export const Icon: React.FC<IconProps> = (props) => {
    return <IconBackground {...props}>{props.icon}</IconBackground>;
};
