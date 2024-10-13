import {Grid2 as Grid} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {BudgetList, StatsWrapper} from '@/features/Budget';
import {CategoryExpenseChart, CategoryIncomeChart, UpcomingSubscriptions} from '@/features/Category';
import {useDocumentTitle} from '@/hooks/useDocumentTitle';

const BudgetView = () => {
  useDocumentTitle(`${AppConfig.appName} - Budget`, true);
  return (
    <React.Fragment>
      <StatsWrapper />

      <Grid size={{xs: 12, lg: 5}}>
        <UpcomingSubscriptions />
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
