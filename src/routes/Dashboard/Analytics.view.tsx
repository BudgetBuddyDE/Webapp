import {Grid2 as Grid} from '@mui/material';
import React from 'react';

import {CategoryExpenseChart, CategoryIncomeChart} from '@/components/Category';
import {DashboardStatsWrapper} from '@/components/DashboardStatsWrapper.component';
import {SubscriptionPieChart} from '@/components/Subscription';
import {MonthlyBalanceChartCard} from '@/components/Transaction/MonthlyBalance';

const AnalyticsView = () => {
  return (
    <React.Fragment>
      <DashboardStatsWrapper />

      {[
        {key: 'monthly-balance-pie-chart', children: <SubscriptionPieChart />},
        {key: 'category-income-pie-chart', children: <CategoryIncomeChart withViewMore />},
        {key: 'category-expense-pie-chart', children: <CategoryExpenseChart withViewMore />},
      ].map(({key, children}) => (
        <Grid key={key} size={{xs: 12, md: 4}}>
          {children}
        </Grid>
      ))}

      <Grid size={{xs: 12, md: 6}}>
        <MonthlyBalanceChartCard />
      </Grid>
    </React.Fragment>
  );
};

export default AnalyticsView;
