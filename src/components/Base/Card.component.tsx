import {
  Box,
  Card as MuiCard,
  CardContent as MuiCardContent,
  type CardContentProps as MuiCardContentProps,
  type CardProps as MuiCardProps,
  type PaperProps,
  Typography,
} from '@mui/material';
import React from 'react';

import {ActionPaper} from './ActionPaper.component';

export type TCardProps = React.PropsWithChildren<MuiCardProps>;

export type TCardSectionProps = React.PropsWithChildren<PaperProps>;

const Card: React.FC<TCardProps> = ({children, sx, ...props}) => {
  return (
    <MuiCard variant="outlined" {...props} sx={{p: 2, ...sx}}>
      {children}
    </MuiCard>
  );
};

const Header: React.FC<TCardSectionProps> = ({children, sx, ...props}) => {
  return (
    <Box {...props} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={sx}>
      {children}
    </Box>
  );
};

const HeaderActions: React.FC<TCardSectionProps & {actionPaperProps?: PaperProps}> = ({
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

const Title: React.FC<TCardSectionProps> = ({children, sx}) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold" sx={sx}>
      {children}
    </Typography>
  );
};

const Subtitle: React.FC<TCardSectionProps> = ({children, sx}) => {
  return (
    <Typography variant="subtitle2" sx={sx}>
      {children}
    </Typography>
  );
};

const Body: React.FC<MuiCardContentProps> = ({children, sx, ...props}) => {
  return <MuiCardContent {...props}>{children}</MuiCardContent>;
};

const Footer: React.FC<TCardSectionProps> = ({children, sx, ...props}) => {
  return (
    <Box {...props} sx={sx}>
      {children}
    </Box>
  );
};

export default Object.assign(Card, {
  Header: Header,
  HeaderActions: HeaderActions,
  Title: Title,
  Subtitle: Subtitle,
  Body: Body,
  Footer: Footer,
});
