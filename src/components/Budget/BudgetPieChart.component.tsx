import {Box} from '@mui/material';
import {ParentSize} from '@visx/responsive';
import {isSameMonth} from 'date-fns';
import React from 'react';

import {ApexPieChart, Card} from '../Base';
import {CircularProgress} from '../Loading';
import {SubscriptionService, useSubscriptions} from '../Subscription';
import {TransactionService, useTransactions} from '../Transaction';

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

  return (
    <Card sx={{p: 0}}>
      <Card.Header sx={{p: 2, pb: 0}}>
        <Box>
          <Card.Title>Title</Card.Title>
          <Card.Subtitle>Subtitle</Card.Subtitle>
        </Box>
      </Card.Header>
      <Card.Body sx={{pt: 1}}>
        {isLoadingTransactions || isLoadingSubscriptions ? (
          <CircularProgress />
        ) : (
          <ParentSize>
            {({width}) => (
              <ApexPieChart
                width={width}
                height={width}
                data={[
                  {
                    label: 'Current Expenses',
                    value: currentExpenses,
                  },
                  {
                    label: 'Future Expenses',
                    value: futureExpenses,
                  },
                  {
                    label: 'Free Amount',
                    value: freeAmount,
                  },
                ]}
                formatAsCurrency
              />
            )}
          </ParentSize>
        )}
      </Card.Body>
    </Card>
  );
};
