import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReceiptIcon from '@mui/icons-material/Receipt';
import format from 'date-fns/format';

export interface TransactionProps {
  category: string;
  receiver: string;
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
        mt: '1rem',
      }}
    >
      <Box
        sx={{
          mr: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          aspectRatio: '1/1',
          height: '2.75rem',
          backgroundColor: (theme) => theme.palette.action.disabledBackground,
          borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          mr: '0.5rem',
        }}
      >
        <Typography fontWeight="bold">
          {category} @ {receiver}
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
