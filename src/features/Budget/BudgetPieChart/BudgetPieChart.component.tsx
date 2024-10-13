import {Box} from '@mui/material';
import {isSameMonth} from 'date-fns';
import React from 'react';

import {Card} from '@/components/Base';
import {PieChart} from '@/components/Base/Charts';
import {CircularProgress} from '@/components/Loading';
import {SubscriptionService, useSubscriptions} from '@/features/Subscription';
import {TransactionService, useTransactions} from '@/features/Transaction';
import {Formatter} from '@/services/Formatter';

export type TBudgetPieChartProps = {};

/**
 * Renders a pie chart component for displaying budget information.
 *
 * @component
 * @example
 * ```tsx
 * <BudgetPieChart />
 * ```
 */
export const BudgetPieChart: React.FC<TBudgetPieChartProps> = () => {
  const {isLoading: isLoadingTransactions, data: transactions} = useTransactions();
  const {isLoading: isLoadingSubscriptions, data: subscriptions} = useSubscriptions();

  const totalIncome: number = React.useMemo(() => {
    const receivedIncome = TransactionService.calculateReceivedEarnings(transactions ?? []);
    const upcomingTransactionIncome = TransactionService.getUpcomingX('INCOME', transactions ?? []);
    const upcomingSubscriptionIncome = SubscriptionService.getUpcomingX('INCOME', subscriptions ?? []);
    return receivedIncome + upcomingTransactionIncome + upcomingSubscriptionIncome;
  }, [transactions, subscriptions]);

  const currentExpenses: number = React.useMemo(() => {
    const now = new Date();
    return (transactions ?? []).reduce((prev, curr) => {
      if (curr.transfer_amount < 0 && isSameMonth(now, curr.processed_at)) {
        return prev + Math.abs(curr.transfer_amount);
      }
      return prev;
    }, 0);
  }, [transactions]);

  const futureExpenses: number = React.useMemo(() => {
    const transactionExpenses = TransactionService.getUpcomingX('EXPENSES', transactions ?? []);
    const upcomingTransactionExpenses = TransactionService.getUpcomingX('EXPENSES', transactions ?? []);
    const upcomingSubscriptionExpenses = SubscriptionService.getUpcomingX('EXPENSES', subscriptions ?? []);
    return transactionExpenses + upcomingTransactionExpenses + upcomingSubscriptionExpenses;
  }, [transactions, subscriptions]);

  const freeAmount: number = totalIncome - (Math.abs(currentExpenses) + Math.abs(futureExpenses));

  const chartData = React.useMemo(() => {
    return [
      {
        id: 'current-expenses',
        label: 'Current Expenses',
        value: currentExpenses,
      },
      {
        id: 'future-expenses',
        label: 'Future Expenses',
        value: futureExpenses,
      },
      {
        id: 'free-amount',
        label: 'Free Amount',
        value: freeAmount,
      },
    ].filter(({value}) => value > 0);
  }, [currentExpenses, futureExpenses, freeAmount]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Budget</Card.Title>
          <Card.Subtitle>How much can you spend?</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body sx={{pt: 1}}>
        {isLoadingTransactions || isLoadingSubscriptions ? (
          <CircularProgress />
        ) : (
          <PieChart
            fullWidth
            primaryText={Formatter.formatBalance(currentExpenses + futureExpenses)}
            secondaryText="Expenses"
            series={[
              {
                data: chartData,
                valueFormatter: value => Formatter.formatBalance(value.value),
              },
            ]}
          />
        )}
      </Card.Body>
    </Card>
  );
};
