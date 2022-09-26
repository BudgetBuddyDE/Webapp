import { FC } from 'react';
import { Typography, Box, Tooltip, SxProps, Theme } from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Card from '../components/card.component';

export interface IStatsProps {
  title: string;
  subtitle: string;
  info?: string;
  icon?: JSX.Element;
}

export const StatsIconStyle: SxProps<Theme> = {
  zIndex: 1,
  position: 'absolute',
  bottom: '-1rem',
  left: '.5rem',
  fontSize: '5.5rem',
  opacity: 0.1,
};

export const Stats: FC<IStatsProps> = ({
  title,
  subtitle,
  info = '',
  icon = <AccountBalanceWalletIcon sx={StatsIconStyle} />,
}) => {
  return (
    <Card sx={{ position: 'relative', textAlign: 'right', overflow: 'hidden' }}>
      {icon}
      <Typography variant="h4">{title}</Typography>
      <Tooltip title={info}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          alignItems="center"
          flexShrink={1}
        >
          <Typography variant="h6">{subtitle}</Typography>
          {info && <InfoIcon sx={{ ml: '.25rem', fontSize: '.9rem' }} />}
        </Box>
      </Tooltip>
    </Card>
  );
};
