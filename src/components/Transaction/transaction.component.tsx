import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import format from 'date-fns/format';
import React from 'react';
import { formatBalance } from '../../utils';
import { Icon } from '../Base/icon.component';

export interface TransactionProps {
  icon?: JSX.Element;
  title: string;
  subtitle: string | string[];
  date?: Date;
  amount: number;
}

export const Transaction: React.FC<TransactionProps> = ({ icon = <ReceiptIcon />, title, subtitle, date, amount }) => {
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
        <Typography fontWeight="bold">{title}</Typography>
        {date && <Chip label={format(date, 'dd.MM')} size="small" variant="outlined" sx={{ mr: 1 }} />}
        {typeof subtitle === 'string' ? (
          <Chip label={subtitle} size="small" variant="outlined" sx={{ mr: 1 }} />
        ) : (
          subtitle.map((subtitleItem, index) => (
            <Chip
              key={'transaction-subtitle-' + index}
              label={subtitleItem}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          ))
        )}
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <Typography fontWeight="bold">{formatBalance(amount)}</Typography>
      </Box>
    </Box>
  );
};
