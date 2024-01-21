import React from 'react';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  BalanceWidget,
  BudgetList,
  BudgetProgressWrapper,
  StatsWrapper,
  useFetchBudgetProgress,
} from '@/core/Budget';
import { CategorySpendingsChart } from '@/core/Category';
import { CategoryIncomeChart } from '@/core/Category/Chart/IncomeChart.component';
import { Grid } from '@mui/material';
import { DailyTransactionChart } from '@/core/Transaction';
import { CircularProgress } from '@/components/Loading';
import { SubscriptionService, useFetchSubscriptions } from '@/core/Subscription';

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';
export type TChartContentType = 'INCOME' | 'SPENDINGS';
export const ChartContentTypes = [
  { type: 'INCOME' as TChartContentType, label: 'Income' },
  { type: 'SPENDINGS' as TChartContentType, label: 'Spendings' },
];

export const Budgets = () => {
  const { budgetProgress, loading: loadingBudgetProgress } = useFetchBudgetProgress();
  const { loading: loadingSubscriptions, subscriptions } = useFetchSubscriptions();

  const getSubscriptionDataByType = React.useCallback(
    (type: 'INCOME' | 'SPENDINGS') => {
      return SubscriptionService.getPlannedBalanceByType(subscriptions, type)
        .filter(({ paused }) => !paused)
        .map((item) => ({
          type: type,
          label: item.category.name,
          description: item.description,
          amount: item.transferAmount,
        }));
    },
    [subscriptions]
  );

  return (
    <ContentGrid title={'Budget'}>
      <Grid item xs={12} md={12} lg={5} xl={5}>
        <DailyTransactionChart />

        {!loadingSubscriptions && (
          <BalanceWidget
            income={getSubscriptionDataByType('INCOME')}
            spendings={getSubscriptionDataByType('SPENDINGS')}
            cardProps={{
              sx: { mt: 2 },
            }}
          />
        )}
      </Grid>

      <Grid container item xs={12} md={12} lg={7} xl={7} spacing={3}>
        <StatsWrapper />

        <Grid item xs={12} md={12} lg={12} xl={12}>
          <BudgetList />

          {loadingBudgetProgress ? (
            <CircularProgress />
          ) : (
            <BudgetProgressWrapper data={budgetProgress} cardProps={{ sx: { mt: 2 } }} />
          )}
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategorySpendingsChart />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Budgets);
