import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { PaymentMethod, Subscription, Transaction } from '../../../models';
import { ActionPaper, Card } from '../../Base';
import { PieChart, PieChartData } from '../../Charts';

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
        <ParentSize>
          {({ width }) => <PieChart width={width} height={width} data={countedChartData} />}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};
