import React from 'react';
import { Box, Paper, Typography, type SxProps, type Theme, type PaperProps } from '@mui/material';
import { ActionPaper } from './ActionPaper.component';

export type TCardProps = React.PropsWithChildren<{
  sx?: SxProps<Theme>;
}>;

export type TCardSectionProps = React.PropsWithChildren<{
  sx?: SxProps<Theme>;
}>;

const Card: React.FC<TCardProps> = ({ children, sx }) => {
  return <Paper sx={{ p: 2, ...sx }}>{children}</Paper>;
};

const Header: React.FC<TCardSectionProps> = ({ children, sx }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={sx}>
      {children}
    </Box>
  );
};

const HeaderActions: React.FC<TCardSectionProps & { actionPaperProps?: PaperProps }> = ({
  children,
  sx,
  actionPaperProps,
}) => {
  return (
    <Box display="flex" flexDirection="row" sx={sx}>
      <ActionPaper {...actionPaperProps}>{children}</ActionPaper>
    </Box>
  );
};

const Title: React.FC<TCardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold" sx={sx}>
      {children}
    </Typography>
  );
};

const Subtitle: React.FC<TCardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle2" sx={sx}>
      {children}
    </Typography>
  );
};

const Body: React.FC<TCardSectionProps> = ({ children, sx }) => {
  return <Box sx={sx}>{children}</Box>;
};

const Footer: React.FC<TCardSectionProps> = ({ children, sx }) => {
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
