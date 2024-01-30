import { Card, NoResults, type TPieChartData } from '@/components/Base';
import { CircularProgress } from '@/components/Loading';
import { DateService } from '@/services';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import React from 'react';
import { useFetchTransactions } from '../../Transaction';
import { isSameMonth } from 'date-fns';
import { PieChart } from '@/components/Base';

export type TChartType = 'MONTH' | 'ALL_TIME';

export const SPENDING_CHART_TYPES: { type: TChartType; text: string }[] = [
  {
    type: 'MONTH',
    text: DateService.shortMonthName() + '.',
  },
  { type: 'ALL_TIME', text: 'All' },
];

export type TCategorySpendingsChartProps = {};

export const CategorySpendingsChart: React.FC<TCategorySpendingsChartProps> = () => {
  const [chart, setChart] = React.useState<TChartType>('MONTH');
  const { loading: loadingTransactions, transactions } = useFetchTransactions();

  const currentChartData: TPieChartData[] = React.useMemo(() => {
    const now = new Date();
    const expensesByCategory = new Map<string, number>();
    transactions
      .filter(({ transferAmount, processedAt }) => {
        return transferAmount < 0 && (chart === 'MONTH' ? isSameMonth(processedAt, now) : true);
      })
      .forEach(({ category: { name }, transferAmount }) => {
        const currAmount = expensesByCategory.get(name);
        if (currAmount) {
          expensesByCategory.set(name, currAmount + Math.abs(transferAmount));
        } else expensesByCategory.set(name, Math.abs(transferAmount));
      });

    return [...expensesByCategory.entries()].map(
      ([category, amount]) => ({ label: category, value: amount } as TPieChartData)
    );
  }, [transactions, chart]);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Spendings</Card.Title>
          <Card.Subtitle>Categorized Spendings</Card.Subtitle>
        </Box>
        <Card.HeaderActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={chart}
            onChange={(event: React.BaseSyntheticEvent) => setChart(event.target.value)}
            exclusive
          >
            {SPENDING_CHART_TYPES.map((button) => (
              <ToggleButton key={button.type} value={button.type}>
                {button.text}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        {loadingTransactions ? (
          <CircularProgress />
        ) : currentChartData.length > 0 ? (
          <Box sx={{ display: 'flex', flex: 1, mt: '1rem', flexDirection: 'column' }}>
            <ParentSize>
              {({ width }) => (
                <PieChart
                  width={width}
                  height={width}
                  data={currentChartData}
                  formatAsCurrency
                  showTotalSum
                />
              )}
            </ParentSize>
          </Box>
        ) : (
          <NoResults
            text={
              chart === 'MONTH'
                ? 'There are no spendings for this month!'
                : "You haven't spent anything yet!"
            }
            sx={{ mt: 2 }}
          />
        )}
      </Card.Body>
    </Card>
  );
};
