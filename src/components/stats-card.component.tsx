import { AccountBalanceWallet as AccountBalanceWalletIcon, Info as InfoIcon } from '@mui/icons-material';
import { Box, Skeleton, SxProps, Theme, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { Card } from '../components';

export interface IStatsProps {
  title: string;
  subtitle: string;
  info?: string;
  icon?: JSX.Element;
  loading?: boolean;
}

export const StatsIconStyle: SxProps<Theme> = {
  zIndex: 1,
  position: 'absolute',
  bottom: '-1rem',
  left: '.5rem',
  fontSize: '5.5rem',
  opacity: 0.25,
  color: (theme) => theme.palette.primary.main,
};

export const Stats: React.FC<IStatsProps> = ({
  title,
  subtitle,
  info = '',
  icon = <AccountBalanceWalletIcon sx={StatsIconStyle} />,
  loading = false,
}) => {
  return (
    <Card sx={{ position: 'relative', textAlign: 'right', overflow: 'hidden' }}>
      {icon}
      <Typography variant="h4">{loading ? <Skeleton width={70} sx={{ ml: 'auto' }} /> : title}</Typography>
      <Tooltip title={info}>
        <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center" flexShrink={1}>
          <Typography variant="h6" sx={{ whiteSpace: { xs: 'wrap', md: 'nowrap' } }}>
            {subtitle}
          </Typography>
          {info && <InfoIcon sx={{ ml: '.25rem', fontSize: '.9rem' }} />}
        </Box>
      </Tooltip>
    </Card>
  );
};
