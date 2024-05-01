import {Grid} from '@mui/material';
import React from 'react';

import {BudgetList, StatsWrapper} from '@/components/Budget';
import {CategoryIncomeChart, CategorySpendingsChart} from '@/components/Category';
import {MonthlyBalanceChartCard, MonthlyBalanceWidget} from '@/components/Transaction/MonthlyBalance';

export const BudgetView = () => {
  return (
    <React.Fragment>
      <Grid item xs={12} md={12} lg={5} xl={5}>
        <MonthlyBalanceWidget />

        <MonthlyBalanceChartCard />
      </Grid>

      <Grid container item xs={12} md={12} lg={7} xl={7} spacing={3}>
        <StatsWrapper />

        <Grid item xs={12} md={12} lg={12} xl={12}>
          <BudgetList />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategorySpendingsChart />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BudgetView;
