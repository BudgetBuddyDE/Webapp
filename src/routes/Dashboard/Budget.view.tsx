import {Grid2 as Grid} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {BudgetList, StatsWrapper} from '@/components/Budget';
import {CategoryExpenseChart, CategoryIncomeChart, UpcomingSubscriptions} from '@/components/Category';
import {MonthlyBalanceChartCard, MonthlyBalanceWidget} from '@/components/Transaction/MonthlyBalance';
import {useDocumentTitle} from '@/hooks';

const BudgetView = () => {
  useDocumentTitle(`${AppConfig.appName} - Budget`, true);
  return (
    <React.Fragment>
      <StatsWrapper />

      <Grid container size={{xs: 12, lg: 5}} spacing={AppConfig.baseSpacing}>
        <Grid size={{xs: 12}}>
          <MonthlyBalanceWidget />
        </Grid>

        <Grid size={{xs: 12}}>
          <UpcomingSubscriptions />
        </Grid>

        <Grid size={{xs: 12}}>
          <MonthlyBalanceChartCard />
        </Grid>
      </Grid>

      <Grid container size={{xs: 12, lg: 7}} spacing={AppConfig.baseSpacing}>
        <Grid size={{xs: 12}}>
          <BudgetList />
        </Grid>

        <Grid size={{xs: 12, lg: 6}}>
          <CategoryExpenseChart />
        </Grid>

        <Grid size={{xs: 12, lg: 6}}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BudgetView;
