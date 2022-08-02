import { FC } from 'react';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { SxProps, Theme } from '@mui/material/styles';
import Card from '../components/card.component';

export interface StatsProps {
  title: string;
  subtitle: string;
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

export const Stats: FC<StatsProps> = ({
  title,
  subtitle,
  icon = <AccountBalanceWalletIcon sx={StatsIconStyle} />,
}) => {
  return (
    <Card sx={{ position: 'relative', textAlign: 'right', overflow: 'hidden' }}>
      {icon}
      <Typography variant="h4">{title}</Typography>
      <Typography variant="h6">{subtitle}</Typography>
    </Card>
  );
};
