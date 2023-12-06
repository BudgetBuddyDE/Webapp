import React from 'react';
import type { CategoryExpensesState } from '@/reducer/CategoryExpenses.reducer';
import { DateService } from '@/services/Date.service';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Card } from '../Base';
import { ActionPaper } from '../Base/ActionPaper.component';
import { CircularProgress } from '../Core/CircularProgress.component';
import { NoResults } from '../Core/NoResults.component';
import { CategoryExpensesChart } from './CategoryExpensesChart.component';

const SPENDING_CHART_TYPES: { type: CategoryExpensesState['chart']; text: string }[] = [
  {
    type: 'MONTH',
    text: DateService.shortMonthName() + '.',
  },
  { type: 'ALL_TIME', text: 'All' },
];

export type CategoryExpensesChartCardProps = {
  loading?: boolean;
  data: CategoryExpensesState;
  onChangeChart: (newChart: CategoryExpensesState['chart']) => void;
};

export const CategoryExpensesChartCard: React.FC<CategoryExpensesChartCardProps> = ({
  loading = false,
  data,
  onChangeChart,
}) => {
  const currentlySelectedChartData = React.useMemo(
    () => (data.chart == 'ALL_TIME' ? data.allTime : data.month),
    [data]
  );

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Spendings</Card.Title>
          <Card.Subtitle>Categorized Spendings</Card.Subtitle>
        </Box>
        <Card.HeaderActions>
          <ActionPaper>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={data.chart}
              onChange={(event: React.BaseSyntheticEvent) => onChangeChart(event.target.value)}
              exclusive
            >
              {SPENDING_CHART_TYPES.map((button) => (
                <ToggleButton key={button.type} value={button.type}>
                  {button.text}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </ActionPaper>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <CircularProgress />
        ) : currentlySelectedChartData.length > 0 ? (
          <Box sx={{ display: 'flex', flex: 1, mt: '1rem' }}>
            <CategoryExpensesChart data={currentlySelectedChartData} />
          </Box>
        ) : (
          <NoResults sx={{ mt: 2 }} />
        )}
      </Card.Body>
    </Card>
  );
};
