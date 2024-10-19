import {Box} from '@mui/material';
import {isSameMonth} from 'date-fns';
import React from 'react';

import {Card} from '@/components/Base/Card';
import {PieChart} from '@/components/Base/Charts';
import {CircularProgress} from '@/components/Loading';
import {useSubscriptions} from '@/features/Subscription';
import {useTransactions} from '@/features/Transaction';
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
  const {
    isLoading: isLoadingTransactions,
    data: transactions,
    getReceivedIncome: tra_getReceivedIncome,
    getPaidExpenses: tra_getPaidExpenses,
    getUpcoming: tra_getUpcoming,
  } = useTransactions();
  const {isLoading: isLoadingSubscriptions, getUpcoming: sub_getUpcoming} = useSubscriptions();

  /**
   * current_expenses = gezahlte transaktionen
   * future_expenses = anstehende transaktionen und ausstehende subscriptions
   * free_amount = (paid_income + upcoming_transaction_income + upcoming_subscription_income) - (current_expenses - future_expenses)
   */

  const currentExpenses: number = React.useMemo(() => {
    if (!transactions) return 0;
    const paidTransactions = tra_getPaidExpenses();
    const expenses = paidTransactions.reduce(
      (prev, curr) => (isSameMonth(new Date(), curr.processed_at) ? prev + Math.abs(curr.transfer_amount) : prev),
      0,
    );
    return expenses;
  }, [tra_getPaidExpenses]);

  const futureExpenses: number = React.useMemo(() => {
    const upcomingTransactionExpenses = tra_getUpcoming('EXPENSES');
    const upcomingSubscriptionExpenses = sub_getUpcoming('EXPENSES');
    return upcomingTransactionExpenses + upcomingSubscriptionExpenses;
  }, [tra_getUpcoming, sub_getUpcoming]);

  const totalIncome: number = React.useMemo(() => {
    return tra_getReceivedIncome() + tra_getUpcoming('INCOME') + sub_getUpcoming('INCOME');
  }, [tra_getReceivedIncome, tra_getUpcoming, sub_getUpcoming]);

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
        value: totalIncome - (currentExpenses + futureExpenses),
      },
    ].filter(({value}) => value > 0);
  }, [totalIncome, currentExpenses, futureExpenses]);

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
