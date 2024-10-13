import {TrendingDown, TrendingUp} from '@mui/icons-material';
import {Chip} from '@mui/material';
import React from 'react';

import {type TLabelBadgeProps} from '@/components/Base/LabelBadge';
import {Formatter} from '@/services/Formatter';

export type TStockPriceProps = {
  price: number;
  trend?: 'up' | 'down';
  currency?: string;
  withIcon?: boolean;
} & Pick<TLabelBadgeProps, 'boxProps'>;

export const StockPrice: React.FC<TStockPriceProps> = ({price, trend, withIcon = false, currency = 'EUR'}) => {
  return (
    <Chip
      variant="outlined"
      icon={trend && withIcon ? trend === 'up' ? <TrendingUp /> : <TrendingDown /> : undefined}
      color={trend ? (trend === 'up' ? 'success' : 'error') : 'primary'}
      label={Formatter.formatBalance(price, currency)}
    />
  );
};
