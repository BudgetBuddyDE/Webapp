import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import format from 'date-fns/format';
import React from 'react';
import { Icon } from '../Base/icon.component';

export interface TransactionProps {
  category: string;
  receiver?: string;
  date: Date | string;
  amount: number;
  icon?: JSX.Element;
}

export const Transaction: React.FC<TransactionProps> = ({
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
        <Typography fontWeight="bold">{receiver && `${receiver}`}</Typography>
        <Chip
          label={typeof date === 'string' ? date : format(date, 'dd.MM')}
          size="small"
          variant="outlined"
        />
        <Chip label={category} size="small" variant="outlined" sx={{ ml: 1 }} />
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <Typography fontWeight="bold">
          {amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </Typography>
      </Box>
    </Box>
  );
};
