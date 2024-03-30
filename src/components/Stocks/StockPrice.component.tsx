import React from 'react';
import { formatBalance } from '@/utils';
import { LabelBadge, type TLabelBadgeProps } from '@/components/Base';

export type TStockPriceProps = {
  price: number;
  trend?: 'up' | 'down';
  currency?: string;
} & Pick<TLabelBadgeProps, 'boxProps'>;

export const StockPrice: React.FC<TStockPriceProps> = ({
  price,
  trend,
  currency = 'EUR',
  boxProps,
}) => {
  return (
    <LabelBadge color={trend ? (trend === 'up' ? 'success' : 'error') : 'primary'} {...boxProps}>
      {formatBalance(price, currency)}
    </LabelBadge>
  );
};
