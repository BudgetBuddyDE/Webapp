import {type TSubscription, type TTransaction} from '@budgetbuddyde/types';
import {Grid} from '@mui/material';
import React from 'react';

import {CategorySpendingsChart} from '@/components/Category';
import {DashboardStatsWrapper} from '@/components/DashboardStatsWrapper.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {CircularProgress} from '@/components/Loading';
import {
  SubscriptionDrawer,
  SubscriptionList,
  type TSusbcriptionDrawerValues,
  useFetchSubscriptions,
} from '@/components/Subscription';
import {
  type TTransactionDrawerValues,
  TransactionDrawer,
  TransactionList,
  useFetchTransactions,
} from '@/components/Transaction';

const LIST_ITEM_COUNT = 6;

export const DashboardView = () => {
  const {transactions, loading: loadingTransactions} = useFetchTransactions();
  const {subscriptions, loading: loadingSubscriptions} = useFetchSubscriptions();
  const [transactionDrawer, dispatchTransactionDrawer] = React.useReducer(
    useEntityDrawer<TTransactionDrawerValues>,
    UseEntityDrawerDefaultState<TTransactionDrawerValues>(),
  );
  const [subscriptionDrawer, dispatchSubscriptionDrawer] = React.useReducer(
    useEntityDrawer<TSusbcriptionDrawerValues>,
    UseEntityDrawerDefaultState<TSusbcriptionDrawerValues>(),
  );
  const latestTransactions: TTransaction[] = React.useMemo(() => {
    return transactions.slice(0, LIST_ITEM_COUNT);
  }, [transactions]);

  const upcomingSubscriptions: TSubscription[] = React.useMemo(() => {
    return subscriptions.filter(({paused}) => !paused).slice(0, LIST_ITEM_COUNT);
  }, [subscriptions]);

  return (
    <React.Fragment>
      <DashboardStatsWrapper />

      <Grid item xs={12} md={6} lg={4} order={{xs: 3, md: 1}}>
        {loadingSubscriptions ? (
          <CircularProgress />
        ) : (
          <SubscriptionList
            data={upcomingSubscriptions}
            onAddSubscription={() => dispatchSubscriptionDrawer({type: 'OPEN', drawerAction: 'CREATE'})}
          />
        )}
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{xs: 1, md: 2}}>
        <CategorySpendingsChart />
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{xs: 2, md: 3}}>
        {loadingTransactions ? (
          <CircularProgress />
        ) : (
          <TransactionList
            title="Latest transactions"
            subtitle="What purchases did you make recently?"
            data={latestTransactions}
            onAddTransaction={() => dispatchTransactionDrawer({type: 'OPEN', drawerAction: 'CREATE'})}
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
