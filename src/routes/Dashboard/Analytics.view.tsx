import {type TCategory} from '@budgetbuddyde/types';
import {Box, Button, Grid, Skeleton, Stack, useTheme} from '@mui/material';
import {isSameMonth} from 'date-fns';
import React from 'react';
import ApexChart from 'react-apexcharts';
import {Link} from 'react-router-dom';

import {Card} from '@/components/Base';
import {CategoryExpenseChart, CategoryIncomeChart} from '@/components/Category';
import {DashboardStatsWrapper} from '@/components/DashboardStatsWrapper.component';
import {SubscriptionPieChart} from '@/components/Subscription';
import {useTransactions} from '@/components/Transaction';
import {MonthlyBalanceChartCard} from '@/components/Transaction/MonthlyBalance';
import {useScreenSize} from '@/hooks';
import {Formatter} from '@/services';

const AnalyticsView = () => {
  const theme = useTheme();
  const screenSize = useScreenSize();
  const {isLoading: isLoadingTransactions, data: transactions} = useTransactions();

  // const income: number = React.useMemo(() => {
  //   if (!transactions) return 0;
  //   const now = new Date();
  //   return transactions.reduce((prev, curr) => {
  //     if (!isSameMonth(now, curr.processed_at)) return prev;
  //     return prev + (curr.transfer_amount >= 0 ? curr.transfer_amount : 0);
  //   }, 0);
  // }, [transactions]);

  // const expenses: number = React.useMemo(() => {
  //   if (!transactions) return 0;

  //   const now = new Date();
  //   return transactions.reduce((prev, curr) => {
  //     if (!isSameMonth(now, curr.processed_at)) return prev;
  //     return prev + (curr.transfer_amount < 0 ? Math.abs(curr.transfer_amount) : 0);
  //   }, 0);
  // }, [transactions]);

  // const balance: number = React.useMemo(() => {
  //   if (!transactions) return 0;

  //   const now = new Date();
  //   return transactions.reduce((prev, curr) => {
  //     if (!isSameMonth(now, curr.processed_at)) return prev;
  //     return prev + curr.transfer_amount;
  //   }, 0);
  // }, [transactions]);

  const groupedTransactions: {categoryName: string; income: number; expenses: number}[] = React.useMemo(() => {
    if (!transactions) return [];

    const now = new Date();
    const temp = new Map<TCategory['id'], {name: TCategory['name']; income: number; expenses: number}>();

    for (const {
      processed_at,
      transfer_amount,
      expand: {
        category: {id, name},
      },
    } of transactions) {
      if (!isSameMonth(now, processed_at)) continue;

      if (temp.has(id)) {
        const curr = temp.get(id)!;
        temp.set(id, {
          ...curr,
          income: transfer_amount > 0 ? curr.income + transfer_amount : curr.income,
          expenses: transfer_amount < 0 ? curr.expenses + Math.abs(transfer_amount) : curr.expenses,
        });
      } else {
        temp.set(id, {
          name,
          income: transfer_amount > 0 ? transfer_amount : 0,
          expenses: transfer_amount < 0 ? Math.abs(transfer_amount) : 0,
        });
      }
    }

    return Array.from(temp.values()).map(({name, income, expenses}) => ({
      categoryName: name,
      income,
      expenses,
    }));
  }, [transactions]);

  return (
    <React.Fragment>
      {/* {(
        [
          {
            label: 'Income',
            value: Formatter.formatBalance(income),
            // valueInformation: `Estimated ${Formatter.formatBalance(income.estimatedIncome)}`,
            icon: <AddRounded />,
            isLoading: isLoadingTransactions,
          },
          {
            label: 'Expenses',
            value: Formatter.formatBalance(expenses),
            // valueInformation: `Estimated ${Formatter.formatBalance(expenses.estimatedExpenses)}`,
            icon: <RemoveRounded />,
            isLoading: isLoadingTransactions,
          },
          {
            label: 'Balance',
            value: Formatter.formatBalance(balance),
            // valueInformation: `Estimated ${Formatter.formatBalance(balance.estimatedBalance)}`,
            icon: <DragHandleRounded />,
            isLoading: isLoadingTransactions,
          },
        ] as TStatsCardProps[]
      ).map((props, idx) => (
        <Grid key={id + '-analytics-' + idx} item xs={4} md={4}>
          <StatsCard {...props} />
        </Grid>
      ))} */}

      <DashboardStatsWrapper />

      <Grid item xs={12} md={6}>
        <Card sx={{p: 0}}>
          <Card.Header sx={{p: 2}}>
            <Box>
              <Card.Title>Grouped transactions</Card.Title>
              <Card.Subtitle>Grouped income & expenses by category</Card.Subtitle>
            </Box>
          </Card.Header>
          <Card.Body>
            {isLoadingTransactions ? (
              <Skeleton variant="rounded" width={`calc(100% - ${theme.spacing(4)})`} height={320} sx={{mx: 2}} />
            ) : (
              <ApexChart
                width={'100%'}
                height={screenSize === 'small' ? 200 : screenSize === 'medium' ? 250 : 320}
                type="bar"
                options={{
                  chart: {
                    type: 'bar',
                    zoom: {enabled: false},
                    toolbar: {show: false},
                  },
                  legend: {show: false},
                  yaxis: {
                    labels: {
                      style: {
                        colors: theme.palette.text.primary,
                      },
                      formatter(val: number) {
                        return Formatter.formatBalance(val);
                      },
                    },
                  },
                  xaxis: {
                    categories: groupedTransactions.map(({categoryName}) => categoryName),
                    labels: {
                      style: {
                        colors: theme.palette.text.primary,
                      },
                    },
                  },
                  grid: {show: true, padding: {left: -12, right: -4, top: -20, bottom: 0}},
                  dataLabels: {enabled: false},
                  plotOptions: {
                    bar: {
                      borderRadius: Math.round(theme.shape.borderRadius / 2.5),
                    },
                  },
                  tooltip: {
                    theme: 'dark',
                    y: {
                      formatter: function (val) {
                        return Formatter.formatBalance(val);
                      },
                    },
                  },
                }}
                series={[
                  {
                    name: 'Income',
                    data: groupedTransactions.map(({income}) => income),
                    color: theme.palette.primary.main,
                  },
                  {
                    name: 'Expenses',
                    data: groupedTransactions.map(({expenses}) => expenses),
                    color: theme.palette.error.main,
                  },
                ]}
              />
            )}
          </Card.Body>
          <Card.Footer sx={{p: 2, pt: 0}}>
            <Stack direction="row" justifyContent={'flex-end'}>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/*@ts-expect-error*/}
              <Button LinkComponent={Link} to="/dashboard/insights">
                View more...
              </Button>
            </Stack>
          </Card.Footer>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <MonthlyBalanceChartCard />
      </Grid>

      <Grid item xs={12} md={4}>
        <SubscriptionPieChart />
      </Grid>

      <Grid item xs={12} md={4}>
        <CategoryIncomeChart withViewMore />
      </Grid>

      <Grid item xs={12} md={4}>
        <CategoryExpenseChart withViewMore />
      </Grid>
    </React.Fragment>
  );
};

export default AnalyticsView;
