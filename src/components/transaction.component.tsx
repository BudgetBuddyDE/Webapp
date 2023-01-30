import ReceiptIcon from '@mui/icons-material/Receipt';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import format from 'date-fns/format';
import { FC } from 'react';
import { Icon } from './base/icon.component';

export interface TransactionProps {
  category: string;
  receiver?: string;
  date: Date | string;
  amount: number;
  icon?: JSX.Element;
}

export const Transaction: FC<TransactionProps> = ({
  icon = <ReceiptIcon />,
  category,
  receiver,
  date,
  amount,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        mt: 1,
      }}
    >
      <Icon icon={icon} sx={{ mr: 1 }} />
      <Box
        sx={{
          mr: 0.5,
        }}
      >
      <Box
        sx={{
          mr: '0.5rem',
        }}
      >
        <Typography fontWeight="bold">
          {category} {receiver && `@ ${receiver}`}
        </Typography>
        <Typography>{typeof date === 'string' ? date : format(date, 'dd.MM.yyyy')}</Typography>
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <Typography fontWeight="bold">
          {amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </Typography>
      </Box>
    </Box>
  );
};
