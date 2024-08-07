import {Box, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {ParentSize} from '@visx/responsive';
import {isSameMonth} from 'date-fns';
import React from 'react';

import {Card, NoResults, type TPieChartData} from '@/components/Base';
import {ApexPieChart} from '@/components/Base/Charts/ApexPieChart.component';
import {CircularProgress} from '@/components/Loading';
import {useTransactions} from '@/components/Transaction';
import {DateService} from '@/services';

export type TChartType = 'MONTH' | 'ALL_TIME';

export const SPENDING_CHART_TYPES: {type: TChartType; text: string}[] = [
  {
    type: 'MONTH',
    text: DateService.shortMonthName() + '.',
  },
  {type: 'ALL_TIME', text: 'All'},
];

export type TCategorySpendingsChartProps = {};

export const CategorySpendingsChart: React.FC<TCategorySpendingsChartProps> = () => {
  const [chart, setChart] = React.useState<TChartType>('MONTH');
  const {isLoading: isLoadingTransactions, data: transactions} = useTransactions();

  const currentChartData: TPieChartData[] = React.useMemo(() => {
    const now = new Date();
    const expensesByCategory = new Map<string, number>();
    (transactions ?? [])
      .filter(({transfer_amount, processed_at}) => {
        return transfer_amount < 0 && (chart === 'MONTH' ? isSameMonth(processed_at, now) : true);
      })
      .forEach(
        ({
          expand: {
            category: {name},
          },
          transfer_amount,
        }) => {
          const currAmount = expensesByCategory.get(name);
          if (currAmount) {
            expensesByCategory.set(name, currAmount + Math.abs(transfer_amount));
          } else expensesByCategory.set(name, Math.abs(transfer_amount));
        },
      );

    return [...expensesByCategory.entries()].map(
      ([category, amount]) => ({label: category, value: amount}) as TPieChartData,
    );
  }, [transactions, chart]);

  return (
    <Card sx={{p: 0}}>
      <Card.Header sx={{p: 2, pb: 0}}>
        <Box>
          <Card.Title>Spendings</Card.Title>
          <Card.Subtitle>Categorized Spendings</Card.Subtitle>
        </Box>
        <Card.HeaderActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={chart}
            onChange={(event: React.BaseSyntheticEvent) => setChart(event.target.value)}
            exclusive>
            {SPENDING_CHART_TYPES.map(button => (
              <ToggleButton key={button.type} value={button.type}>
                {button.text}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        {isLoadingTransactions ? (
          <CircularProgress />
        ) : currentChartData.length > 0 ? (
          <Box sx={{display: 'flex', flex: 1, mt: '1rem', flexDirection: 'column'}}>
            <ParentSize>
              {({width}) => (
                <ApexPieChart width={width} height={width} data={currentChartData} formatAsCurrency showTotal />
              )}
            </ParentSize>
          </Box>
        ) : (
          <NoResults
            text={chart === 'MONTH' ? 'There are no spendings for this month!' : "You haven't spent anything yet!"}
            sx={{m: 2}}
          />
        )}
      </Card.Body>
    </Card>
  );
};
