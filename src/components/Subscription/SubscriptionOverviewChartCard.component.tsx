import React from 'react';
import { Subscription } from '@/models/Subscription.model';
import { SubscriptionService } from '@/services/Subscription.service';
import { CategoryOverview } from '@/type/category.type';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { Card } from '../Base';
import { ActionPaper } from '../Base/ActionPaper.component';
import { PieChart, type PieChartData } from '../Chart/PieChart.component';
import { NoResults } from '../Core/NoResults.component';

export type SubscriptionOverviewChartCardProps = {
  subscriptions: Subscription[];
};

export function transformCategoryOverviewIntoArray(overview: CategoryOverview): PieChartData[] {
  const result: PieChartData[] = [];
  for (const categoryId in overview) {
    if (overview.hasOwnProperty(categoryId)) {
      const { amount, name } = overview[categoryId];
      result.push({ label: name, value: amount });
    }
  }
  return result;
}

export const SubscriptionOverviewChartCard: React.FC<SubscriptionOverviewChartCardProps> = ({ subscriptions }) => {
  const [currentView, setCurrentView] = React.useState<'EARNINGS' | 'EXPENSES'>('EARNINGS');

  const earningData: PieChartData[] = React.useMemo(
    () => transformCategoryOverviewIntoArray(SubscriptionService.calculateMonthlyEarningsPerCategory(subscriptions)),
    [subscriptions]
  );

  const expenseseData: PieChartData[] = React.useMemo(
    () => transformCategoryOverviewIntoArray(SubscriptionService.calculateMonthlyExpensesPerCategory(subscriptions)),
    [subscriptions]
  );

  const displayedData: PieChartData[] = React.useMemo(
    () => (currentView === 'EARNINGS' ? earningData : expenseseData),
    [currentView, subscriptions]
  );

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Subscriptions</Card.Title>
          <Card.Subtitle>Your subscriptions overview</Card.Subtitle>
        </Box>
        <Card.HeaderActions>
          <ActionPaper>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={currentView}
              onChange={(event: React.BaseSyntheticEvent) => setCurrentView(event.target.value)}
              exclusive
            >
              <ToggleButton value="EARNINGS">Earnings</ToggleButton>
              <ToggleButton value="EXPENSES">Expenses</ToggleButton>
            </ToggleButtonGroup>
          </ActionPaper>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body sx={{ pt: 1 }}>
        {displayedData.length > 0 ? (
          <ParentSize>
            {({ width }) => (
              <PieChart width={width} height={width} data={displayedData} formatAsCurrency showTotalSum />
            )}
          </ParentSize>
        ) : (
          <NoResults text="No data was found for this view" />
        )}
      </Card.Body>
    </Card>
  );
};
