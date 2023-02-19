import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { PaymentMethod, Transaction } from '../../../models';
import { ActionPaper, Card } from '../../Base';
import { PieChart, PieChartData } from '../../Charts';

export interface EarningsByPaymentMethodProps {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
}

export const EarningsByPaymentMethod: React.FC<EarningsByPaymentMethodProps> = ({
  paymentMethods,
  transactions,
}) => {
  const [chartContent, setChartContent] = React.useState<'INCOME' | 'SPENDINGS'>('INCOME');

  const incomeStats = React.useMemo(() => {
    if (paymentMethods.length < 1 || transactions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      sum: transactions.reduce((prev, cur) => {
        return prev + (cur.paymentMethods.id === id && cur.amount > 0 ? cur.amount : 0);
      }, 0),
    }));
  }, [paymentMethods, transactions]);

  const spendingsStats = React.useMemo(() => {
    if (paymentMethods.length < 1 || transactions.length < 1) return [];
    return paymentMethods.map(({ id, name }) => ({
      name: name,
      sum: transactions.reduce((prev, cur) => {
        return prev + (cur.paymentMethods.id === id && cur.amount < 0 ? cur.amount : 0);
      }, 0),
    }));
  }, [paymentMethods]);

  const chartData: PieChartData[] = React.useMemo(() => {
    return (chartContent === 'INCOME' ? incomeStats : spendingsStats).map(({ name, sum }) => ({
      label: name,
      value: sum,
    }));
  }, [chartContent, incomeStats, spendingsStats]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Balance</Card.Title>
          <Card.Subtitle>
            How much did u {chartContent === 'INCOME' ? 'earn' : 'spend'}?
          </Card.Subtitle>
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
              <ToggleButton value={'INCOME'}>Income</ToggleButton>
              <ToggleButton value={'SPENDINGS'}>Spendings</ToggleButton>
            </ToggleButtonGroup>
          </ActionPaper>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body sx={{ mt: 2 }}>
        <ParentSize>
          {({ width }) => (
            <PieChart width={width} height={width} data={chartData} formatAsCurrency />
          )}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};
