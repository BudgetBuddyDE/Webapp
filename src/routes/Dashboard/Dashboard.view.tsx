import {type TSubscription, type TTransaction} from '@budgetbuddyde/types';
import {Grid2 as Grid, Stack} from '@mui/material';
import React from 'react';

import {AppConfig} from '@/app.config';
import {BudgetPieChart} from '@/components/Budget';
import {CategoryExpenseChart, UpcomingSubscriptions} from '@/components/Category';
import {DashboardStatsWrapper} from '@/components/DashboardStatsWrapper.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {CircularProgress} from '@/components/Loading';
import {
  SubscriptionDrawer,
  SubscriptionList,
  type TSusbcriptionDrawerValues,
  useSubscriptions,
} from '@/components/Subscription';
import {
  type TTransactionDrawerValues,
  TransactionDrawer,
  TransactionList,
  TransactionService,
  useTransactions,
} from '@/components/Transaction';
import {useDocumentTitle} from '@/hooks';

const LIST_ITEM_COUNT = 6;

const DashboardView = () => {
  useDocumentTitle(`${AppConfig.appName} - Dashboard`, true);
  const {data: transactions, isLoading: isLoadingTransactions} = useTransactions();
  const {data: subscriptions, isLoading: loadingSubscriptions} = useSubscriptions();
  const [transactionDrawer, dispatchTransactionDrawer] = React.useReducer(
    useEntityDrawer<TTransactionDrawerValues>,
    UseEntityDrawerDefaultState<TTransactionDrawerValues>(),
  );
  const [subscriptionDrawer, dispatchSubscriptionDrawer] = React.useReducer(
    useEntityDrawer<TSusbcriptionDrawerValues>,
    UseEntityDrawerDefaultState<TSusbcriptionDrawerValues>(),
  );
  const latestTransactions: TTransaction[] = React.useMemo(() => {
    if (!transactions) return [];
    return TransactionService.getLatestTransactions(transactions, LIST_ITEM_COUNT);
  }, [transactions]);

  const upcomingSubscriptions: TSubscription[] = React.useMemo(() => {
    if (!subscriptions) return [];
    return subscriptions.filter(({paused}) => !paused).slice(0, LIST_ITEM_COUNT);
  }, [subscriptions]);

  const handler = {
    onAddSubscription: () => {
      dispatchSubscriptionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    onAddTransaction: () => {
      dispatchTransactionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
  };

  return (
    <React.Fragment>
      <DashboardStatsWrapper />

      <Grid size={{xs: 12, md: 6, lg: 4}} order={{xs: 3, md: 1}}>
        <Stack spacing={AppConfig.baseSpacing}>
          {loadingSubscriptions ? (
            <CircularProgress />
          ) : (
            <SubscriptionList data={upcomingSubscriptions} onAddSubscription={handler.onAddSubscription} />
          )}

          <UpcomingSubscriptions />
        </Stack>
      </Grid>

      <Grid size={{xs: 12, md: 6, lg: 4}} order={{xs: 1, md: 2}}>
        <Stack spacing={AppConfig.baseSpacing}>
          <CategoryExpenseChart />
          <BudgetPieChart />
        </Stack>
      </Grid>

      <Grid size={{xs: 12, md: 6, lg: 4}} order={{xs: 2, md: 3}}>
        {isLoadingTransactions ? (
          <CircularProgress />
        ) : (
          <TransactionList
            title="Latest transactions"
            subtitle="What purchases did you make recently?"
            data={latestTransactions}
            onAddTransaction={handler.onAddTransaction}
          />
        )}
      </Grid>

      <TransactionDrawer
        {...transactionDrawer}
        onClose={() => dispatchTransactionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <SubscriptionDrawer
        {...subscriptionDrawer}
        onClose={() => dispatchSubscriptionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />
    </React.Fragment>
  );
};

export default DashboardView;
