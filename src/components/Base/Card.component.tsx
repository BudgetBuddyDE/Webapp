import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface ICardProps extends React.PropsWithChildren {
  sx?: SxProps<Theme>;
}

export interface ICardSectionProps extends React.PropsWithChildren {
  sx?: SxProps<Theme>;
}

const Card: React.FC<ICardProps> = ({ children, sx }) => {
  return <Paper sx={{ p: 2, ...sx }}>{children}</Paper>;
};

const Header: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={sx}>
      {children}
    </Box>
  );
};

const HeaderActions: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Box display="flex" flexDirection="row" sx={sx}>
      {children}
    </Box>
  );
};

const Title: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold" sx={sx}>
      {children}
    </Typography>
  );
};

const Subtitle: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle2" sx={sx}>
      {children}
    </Typography>
  );
};

const Body: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return <Box sx={sx}>{children}</Box>;
};

const Footer: React.FC<ICardSectionProps> = ({ children, sx }) => {
  return <Box sx={sx}>{children}</Box>;
};

export default Object.assign(Card, {
  Header: Header,
  HeaderActions: HeaderActions,
  Title: Title,
  Subtitle: Subtitle,
  Body: Body,
  Footer: Footer,
});
