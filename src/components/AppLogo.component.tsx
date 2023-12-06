import React from 'react';
import { type SxProps, type Theme } from '@mui/material';
import { Image } from './Base';

export type TAppLogoProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & { sx?: SxProps<Theme> };

export const AppLogo: React.FC<TAppLogoProps> = ({ sx, ...imageProps }) => {
  return (
    <Image
      src="/logo.png"
      alt="BudgetBuddy Logo"
      {...imageProps}
      sx={{
        width: '6rem',
        height: 'auto',
        aspectRatio: '1/1',
        ...sx,
      }}
    />
  );
};
