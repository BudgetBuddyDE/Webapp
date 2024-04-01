import React from 'react';
import {SparklineWidget, type TSparklineWidget} from '@/components/Base';
import {useFetchMonthlyBalance} from './useFetchMonthlyBalance.hook';

export type TMonthlyBalanceWidget = {
  cardPros?: TSparklineWidget['cardProps'];
};

export const MonthlyBalanceWidget: React.FC<TMonthlyBalanceWidget> = ({cardPros}) => {
  const {loading, balances} = useFetchMonthlyBalance();

  const data = React.useMemo(() => {
    return balances.map(balance => balance.balance).reverse();
  }, [balances]);

  const months = React.useMemo(() => {
    return balances.map(balance => balance.month).reverse();
  }, [balances]);

  if (loading) return null;
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
