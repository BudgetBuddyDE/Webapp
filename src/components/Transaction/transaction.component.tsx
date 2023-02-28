import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import format from 'date-fns/format';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context';
import { Category } from '../../models';
import type { ICategoryView } from '../../types';
import { formatBalance } from '../../utils';
import { Icon } from '../Base/icon.component';

export interface TransactionProps {
  icon?: JSX.Element;
  title: string;
  subtitle: string | string[];
  category?: ICategoryView | Category;
  type?: 'transaction' | 'subscription';
  date?: Date;
  amount: number;
}

export const Transaction: React.FC<TransactionProps> = ({
  icon = <ReceiptIcon />,
  title,
  subtitle,
  category,
  type = 'transaction',
  date,
  amount,
}) => {
  const navigate = useNavigate();
  const { setFilter } = React.useContext(StoreContext);
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
        {category && type && (
          <Chip
            label={category.name}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setFilter((prev) => ({ ...prev, categories: [...(prev.categories ?? []), category.id] }));
              navigate('/' + type + 's');
            }}
          />
        )}
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <Typography fontWeight="bold">{formatBalance(amount)}</Typography>
      </Box>
    </Box>
  );
};
