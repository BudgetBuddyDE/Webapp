import { Box, Paper, SxProps, Theme, Typography } from '@mui/material';
import { FC, PropsWithChildren } from 'react';

export interface ICardProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export interface ICardSectionProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

const Card: FC<ICardProps> = ({ children, sx }) => {
  return <Paper sx={{ p: 2, ...sx }}>{children}</Paper>;
};

const Header: FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={sx}>
      {children}
    </Box>
  );
};

const HeaderActions: FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Box display="flex" flexDirection="row" sx={sx}>
      {children}
    </Box>
  );
};

const Title: FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold" sx={sx}>
      {children}
    </Typography>
  );
};

const Subtitle: FC<ICardSectionProps> = ({ children, sx }) => {
  return (
    <Typography variant="subtitle2" sx={sx}>
      {children}
    </Typography>
  );
};

const Body: FC<ICardSectionProps> = ({ children, sx }) => {
  return <Box sx={sx}>{children}</Box>;
};

const Footer: FC<ICardSectionProps> = ({ children, sx }) => {
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
