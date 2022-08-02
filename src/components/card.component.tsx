import { FC, PropsWithChildren } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/system';

export interface ICardProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

const Card: FC<ICardProps> = ({ children, sx }) => {
  return <Paper sx={{ p: 2, ...sx }}>{children}</Paper>;
};

const Header: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      {children}
    </Box>
  );
};

const HeaderActions: FC<PropsWithChildren> = ({ children }) => {
  return <Box>{children}</Box>;
};

const Title: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Typography variant="subtitle1" fontWeight="bold">
      {children}
    </Typography>
  );
};

const Subtitle: FC<PropsWithChildren> = ({ children }) => {
  return <Typography variant="subtitle2">{children}</Typography>;
};

const Body: FC<PropsWithChildren> = ({ children }) => {
  return <Box>{children}</Box>;
};

const Footer: FC<PropsWithChildren> = ({ children }) => {
  return <Box>{children}</Box>;
};

export default Object.assign(Card, {
  Header: Header,
  HeaderActions: HeaderActions,
  Title: Title,
  Subtitle: Subtitle,
  Body: Body,
  Footer: Footer,
});
