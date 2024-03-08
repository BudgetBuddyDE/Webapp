import { Card } from '@/components/Base';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { MonthlyBalanceChart } from './MonthlyBalanceChart.component';
import { useFetchMonthlyBalance } from './useFetchMonthlyBalance.hook';
import { type TMonthlyBalance } from '@budgetbuddyde/types';
import { debounce } from 'lodash';
import { format, isSameYear } from 'date-fns';
import { formatBalance } from '@/utils';
import { DateService } from '@/services';

export type TMonthlyBalanceChartCardProps = {};

export const MonthlyBalanceChartCard: React.FC<TMonthlyBalanceChartCardProps> = () => {
  const { loading, balances } = useFetchMonthlyBalance();
  const [selectedBarGroup, setSelectedBarGroup] = React.useState<TMonthlyBalance | null>(null);

  const handler = {
    formatMonth(date: Date | string) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return `${DateService.shortMonthName(dateObj)} ${
        isSameYear(dateObj, new Date()) ? '' : format(dateObj, 'yy')
      }`;
    },
    onHoverOnBarGroup(monthlyBalance: TMonthlyBalance | null) {
      if (!monthlyBalance) {
        setSelectedBarGroup(balances[0]);
        return;
      }
      setSelectedBarGroup(monthlyBalance);
    },
  };

  React.useEffect(() => {
    setSelectedBarGroup(balances[0]);
    return () => {
      setSelectedBarGroup(null);
    };
  }, [balances]);

  return (
    <Card sx={{ mt: 2 }}>
      <Card.Header>
        <Box>
          <Card.Title>Monthly Balance</Card.Title>
          <Card.Subtitle>Your monthly balance for the past months</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body>
        <Paper elevation={0} sx={{ mt: '1rem' }}>
          {!loading && selectedBarGroup && (
            <Box sx={{ ml: 2, mt: 1 }}>
              <Typography variant="caption">
                {handler.formatMonth(selectedBarGroup.month)}
              </Typography>
              <Typography variant="subtitle1">{formatBalance(selectedBarGroup.balance)}</Typography>
            </Box>
          )}

          <ParentSize>
            {({ width }) =>
              loading ? (
                <Skeleton variant="rounded" width={width} height={width * 0.6} />
              ) : (
                <MonthlyBalanceChart
                  data={balances.slice(0, width > 300 ? 7 : 6).reverse()}
                  width={width}
                  height={width * 0.6}
                  onSelectBarGroup={debounce((group) => handler.onHoverOnBarGroup(group), 50)}
                />
              )
            }
          </ParentSize>
        </Paper>
      </Card.Body>
    </Card>
  );
};
