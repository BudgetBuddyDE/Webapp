import format from 'date-fns/format';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '@/context/Store.context';
import { Category } from '@/models/Category.model';
import type { CategoryView } from '@/type/category.type';
import { formatBalance } from '@/util/formatBalance.util';
import { ReceiptRounded as ReceiptIcon } from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import { Icon } from '../Core/Icon.component';

export type TransactionProps = {
  icon?: JSX.Element;
  title: string;
  subtitle?: string | string[];
  category?: Category | CategoryView;
  type?: 'transaction' | 'subscription';
  date?: Date;
  amount: number;
};

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
        {date && (
          <Chip
            label={format(date, 'dd.MM')}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setFilter((prev) => ({ ...prev, dateFrom: date, dateTo: date }));
              navigate('/' + type + 's');
            }}
          />
        )}
        {subtitle && subtitle.length > 0 ? (
          typeof subtitle === 'string' ? (
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
          )
        ) : null}
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
