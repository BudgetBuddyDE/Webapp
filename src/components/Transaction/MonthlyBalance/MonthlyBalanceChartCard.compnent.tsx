import {type TMonthlyBalance} from '@budgetbuddyde/types';
import {Box, Skeleton, useTheme} from '@mui/material';
import {BarChart} from '@mui/x-charts/BarChart';
import React from 'react';

import {Card} from '@/components/Base';
import {useScreenSize} from '@/hooks';
import {Formatter} from '@/services';

import {useMonthlyBalances} from './useMonthlyBalance.hook';

export type TMonthlyBalanceChartCardProps = {};

export const MonthlyBalanceChartCard: React.FC<TMonthlyBalanceChartCardProps> = () => {
  const theme = useTheme();
  const screenSize = useScreenSize();
  const {isLoading, data: monthlyBalances} = useMonthlyBalances();

  const relevantBalances: TMonthlyBalance[] = React.useMemo(() => {
    if (!monthlyBalances) return [];
    return monthlyBalances.slice(0, screenSize === 'small' ? 6 : 12);
  }, [monthlyBalances, screenSize]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Monthly Balance</Card.Title>
          <Card.Subtitle>Your monthly balance for the past {relevantBalances.length ?? 0} months</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Skeleton variant="rounded" width={'100%'} height={300} />
        ) : (
          <BarChart
            borderRadius={8}
            colors={[theme.palette.success.main, theme.palette.warning.main]}
            xAxis={[
              {
                scaleType: 'band',
                data: relevantBalances
                  .map(({date}) => `${Formatter.formatDate().shortMonthName(date)} ${date.getFullYear()}`)
                  .reverse(),
              },
            ]}
            yAxis={[
              {
                valueFormatter: value => Formatter.formatBalance(value ?? 0),
              },
            ]}
            series={[
              {
                label: 'Income',
                data: relevantBalances.map(({income}) => income).reverse(),
                color: theme.palette.success.main,
              },
              {
                label: 'Expenses',
                data: relevantBalances.map(({expenses}) => expenses).reverse(),
                color: theme.palette.error.main,
              },
            ]}
            height={300}
            margin={{left: 80, right: 0, top: 20, bottom: 20}}
            grid={{horizontal: true}}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        )}
      </Card.Body>
    </Card>
  );
};
