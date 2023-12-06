import React from 'react';
import { Link } from 'react-router-dom';
import { AppConfig } from '@/app.config';
import { SavingsRounded as SavingsIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import type { BoxProps, IconProps, TypographyProps } from '@mui/material';

export type BrandProps = {
  boxStyle?: BoxProps['sx'];
  iconStyle?: IconProps['sx'];
  typographyStyle?: TypographyProps['sx'];
};

export const Brand: React.FC<BrandProps> = ({ boxStyle, iconStyle, typographyStyle }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...boxStyle }}>
      <SavingsIcon sx={{ mr: 1, ...iconStyle }} />
      <Typography
        variant="h5"
        component={Link}
        to="/"
        noWrap
        sx={{
          fontWeight: 700,
          color: 'inherit',
          textDecoration: 'none',
          ...typographyStyle,
        }}
      >
        {AppConfig.appName}
      </Typography>
    </Box>
  );
};
