import { Alert, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { PaymentMethod, Subscription, Transaction } from '../../../models';
import { ActionPaper, Card } from '../../Base';
import { PieChart, PieChartData } from '../../Charts';
import { NoResults } from '../../Core';

export interface UsedByPaymentMethodProps {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  subscriptions: Subscription[];
}

export const UsedByPaymentMethod: React.FC<UsedByPaymentMethodProps> = ({
  paymentMethods,
  transactions,
  subscriptions,
}) => {
  const [chartContent, setChartContent] = React.useState<'TRANSACTIONS' | 'SUBSCRIPTIONS'>(
    'TRANSACTIONS'
  );

  const paymentMethodsUsedInTransactions = React.useMemo(() => {
    if (paymentMethods.length < 1 || transactions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      count: transactions.reduce((prev, cur) => prev + (cur.paymentMethods.id === id ? 1 : 0), 0),
    }));
  }, [paymentMethods, transactions]);

  const paymentMethodsUsedInSubscriptions = React.useMemo(() => {
    if (paymentMethods.length < 1 || subscriptions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      count: subscriptions.reduce((prev, cur) => prev + (cur.paymentMethods.id === id ? 1 : 0), 0),
    }));
  }, [paymentMethods, subscriptions]);

  const countedChartData: PieChartData[] = React.useMemo(() => {
    return (
      chartContent === 'TRANSACTIONS'
        ? paymentMethodsUsedInTransactions
        : paymentMethodsUsedInSubscriptions
    ).map(({ name, count }) => ({
      label: name,
      value: count,
    }));
  }, [chartContent, paymentMethodsUsedInTransactions, paymentMethodsUsedInSubscriptions]);

  const warnMsg: string = React.useMemo(() => {
    if (countedChartData.length > 0) return '';
    let missing: string[] = [];

    if (transactions.length < 1) missing.push('transactions');
    if (paymentMethods.length < 1) missing.push('payment-methods');
    if (subscriptions.length < 1) missing.push('subscriptions');

    return 'You are missing out on ' + missing.join(', ') + '!';
  }, [countedChartData]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Counted</Card.Title>
          <Card.Subtitle>How did u pay?</Card.Subtitle>
        </Box>

        <Card.HeaderActions>
          <ActionPaper>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={chartContent}
              onChange={(event: React.BaseSyntheticEvent) => setChartContent(event.target.value)}
              exclusive
            >
              <ToggleButton value={'TRANSACTIONS'}>Transactions</ToggleButton>
              <ToggleButton value={'SUBSCRIPTIONS'}>Subscriptions</ToggleButton>
            </ToggleButtonGroup>
          </ActionPaper>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body sx={{ mt: 2 }}>
        {countedChartData.length > 0 ? (
          <ParentSize>
            {({ width }) => <PieChart width={width} height={width} data={countedChartData} />}
          </ParentSize>
        ) : warnMsg.length > 0 ? (
          <Alert severity="warning">{warnMsg}</Alert>
        ) : (
          <NoResults />
        )}
      </Card.Body>
    </Card>
  );
};
