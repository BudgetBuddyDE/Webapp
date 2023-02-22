import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { Category, Transaction } from '../../../models';
import { ActionPaper, Card } from '../../Base';
import { PieChart, PieChartData } from '../../Charts';

export interface EarningsByCategoryProps {
  categories: Category[];
  transactions: Transaction[];
}

export const EarningsByCategory: React.FC<EarningsByCategoryProps> = ({
  categories,
  transactions,
}) => {
  const [chartContent, setChartContent] = React.useState<'INCOME' | 'SPENDINGS'>('INCOME');

  const incomeStats = React.useMemo(() => {
    if (categories.length < 1 || transactions.length < 1) return [];
    return categories.map(({ id, name }) => ({
      name: name,
      sum: transactions.reduce((prev, cur) => {
        return prev + (cur.categories.id === id && cur.amount > 0 ? cur.amount : 0);
      }, 0),
    }));
  }, [categories, transactions]);

  const spendingsStats = React.useMemo(() => {
    if (categories.length < 1 || transactions.length < 1) return [];
    return categories.map(({ id, name }) => ({
      name: name,
      sum: transactions.reduce((prev, cur) => {
        return prev + (cur.categories.id === id && cur.amount < 0 ? cur.amount : 0);
      }, 0),
    }));
  }, [categories]);

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
