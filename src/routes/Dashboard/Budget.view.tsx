import {Grid} from '@mui/material';
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

      <Grid container item xs={12} md={12} lg={5} xl={5} spacing={AppConfig.baseSpacing}>
        <Grid item xs={12}>
          <MonthlyBalanceWidget />
        </Grid>

        <Grid item xs={12}>
          <UpcomingSubscriptions />
        </Grid>

        <Grid item xs={12}>
          <MonthlyBalanceChartCard />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={12} lg={7} xl={7} spacing={AppConfig.baseSpacing}>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <BudgetList />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryExpenseChart />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BudgetView;
