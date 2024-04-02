import React from 'react';
import {Grid} from '@mui/material';
import {CreateTransactionDrawer, TransactionList, useFetchTransactions} from '@/components/Transaction';
import {CreateSubscriptionDrawer, SubscriptionList, useFetchSubscriptions} from '@/components/Subscription';
import {
  type TCreateSubscriptionPayload,
  type TCreateTransactionPayload,
  type TSubscription,
  type TTransaction,
} from '@budgetbuddyde/types';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks';
import {CircularProgress} from '@/components/Loading';
import {CategorySpendingsChart} from '@/components/Category';
import {DashboardStatsWrapper} from '@/components/DashboardStatsWrapper.component';

const LIST_ITEM_COUNT = 6;

export const DashboardView = () => {
  const {transactions, loading: loadingTransactions} = useFetchTransactions();
  const {subscriptions, loading: loadingSubscriptions} = useFetchSubscriptions();
  const [showCreateTransactionDrawer, dispatchCreateTransactionDrawer] = React.useReducer(
    useEntityDrawer<TCreateTransactionPayload>,
    CreateEntityDrawerState<TCreateTransactionPayload>(),
  );
  const [showCreateSubscriptionDrawer, dispatchCreateSubscriptionDrawer] = React.useReducer(
    useEntityDrawer<TCreateSubscriptionPayload>,
    CreateEntityDrawerState<TCreateSubscriptionPayload>(),
  );

  const latestTransactions: TTransaction[] = React.useMemo(() => {
    return transactions.slice(0, LIST_ITEM_COUNT);
  }, [transactions]);

  const upcomingTransactions: TTransaction[] = React.useMemo(() => {
    const now = new Date();
    return transactions.filter(({processed_at}) => processed_at >= now).slice(0, LIST_ITEM_COUNT);
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
            onAddSubscription={() => dispatchCreateSubscriptionDrawer({type: 'open'})}
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
            onAddTransaction={() => dispatchCreateTransactionDrawer({type: 'open'})}
          />
        )}

        {loadingTransactions ? (
          <CircularProgress />
        ) : (
          <TransactionList
            cardProps={{sx: {mt: 3}}}
            title="Upcoming Transactions"
            noResultsMessage="You don't have any upcoming transactions"
            data={upcomingTransactions}
            onAddTransaction={() => dispatchCreateTransactionDrawer({type: 'open'})}
          />
        )}
      </Grid>

      <CreateTransactionDrawer
        {...showCreateTransactionDrawer}
        onClose={() => dispatchCreateTransactionDrawer({type: 'close'})}
      />

      <CreateSubscriptionDrawer
        {...showCreateSubscriptionDrawer}
        onClose={() => dispatchCreateSubscriptionDrawer({type: 'close'})}
      />
    </React.Fragment>
  );
};

export default DashboardView;
