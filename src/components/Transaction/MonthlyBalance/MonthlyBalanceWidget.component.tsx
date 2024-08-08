import React from 'react';

import {SparklineWidget, type TSparklineWidget} from '@/components/Base';

import {useMonthlyBalances} from './useMonthlyBalance.hook';

export type TMonthlyBalanceWidget = {
  cardPros?: TSparklineWidget['cardProps'];
};

export const MonthlyBalanceWidget: React.FC<TMonthlyBalanceWidget> = ({cardPros}) => {
  const {isLoading, data: monthlyBalances} = useMonthlyBalances();

  const data: number[] = React.useMemo(() => {
    if (!monthlyBalances) return [];
    return monthlyBalances.map(balance => balance.balance).reverse();
  }, [monthlyBalances]);

  const months: Date[] = React.useMemo(() => {
    if (!monthlyBalances) return [];
    return monthlyBalances.map(balance => balance.date).reverse();
  }, [monthlyBalances]);

  if (isLoading) return null;
  return (
    <SparklineWidget
      title="Monthly balance"
      subtitle={`Your monthly balance for the last ${months.length} months.`}
      data={data}
      // sparklineProps={{
      //   data: data,
      //   valueFormatter: formatBalance,
      //   xAxis: {
      //     data: months,
      //     valueFormatter: (value) =>
      //       `${DateService.shortMonthName(value)} ${
      //         isSameYear(value, new Date()) ? '' : value.getFullYear()
      //       }`,
      //   },
      // }}
      cardProps={cardPros}
    />
  );
};
