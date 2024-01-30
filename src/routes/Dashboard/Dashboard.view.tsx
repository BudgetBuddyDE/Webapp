import React, { useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { type TSubscription, type TTransaction } from '@budgetbuddyde/types';
import { DashboardStatsWrapper } from '@/components/DashboardStatsWrapper.component';
import { CircularProgress } from '@/components/Loading';
import { CategorySpendingsChart } from '@/core/Category';
import { CreateSubscriptionDrawer, SubscriptionList } from '@/core/Subscription';
import { useFetchSubscriptions } from '@/core/Subscription';
import { TransactionList, useFetchTransactions } from '@/core/Transaction';
import { CreateTransactionDrawer } from '@/core/Transaction/CreateTransactionDrawer.component';

const LIST_ITEM_COUNT = 6;

export const DashboardView = () => {
  const { transactions, loading: loadingTransactions } = useFetchTransactions();
  const { subscriptions, loading: loadingSubscriptions } = useFetchSubscriptions();
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const [showSubscriptionDrawer, setShowSubscriptionDrawer] = useState(false);

  const latestTransactions: TTransaction[] = useMemo(() => {
    return transactions.slice(0, LIST_ITEM_COUNT);
  }, [transactions]);

  const upcomingTransactions: TTransaction[] = useMemo(() => {
    const now = new Date();
    return transactions.filter(({ processedAt }) => processedAt >= now).slice(0, LIST_ITEM_COUNT);
  }, [transactions]);

  const upcomingSubscriptions: TSubscription[] = useMemo(() => {
    return subscriptions.filter(({ paused }) => !paused).slice(0, LIST_ITEM_COUNT);
  }, [subscriptions]);

  return (
    <React.Fragment>
      <DashboardStatsWrapper />

      <Grid item xs={12} md={6} lg={4} order={{ xs: 3, md: 1 }}>
        {loadingSubscriptions ? (
          <CircularProgress />
        ) : (
          <SubscriptionList
            data={upcomingSubscriptions}
            onAddSubscription={() => setShowSubscriptionDrawer(true)}
          />
        )}
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <CategorySpendingsChart />
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{ xs: 2, md: 3 }}>
        {loadingTransactions ? (
          <CircularProgress />
        ) : (
          <TransactionList
            title="Latest transactions"
            subtitle="What purchases did you make recently?"
            data={latestTransactions}
            onAddTransaction={() => setShowTransactionDrawer(true)}
          />
        )}

        {loadingTransactions ? (
          <CircularProgress />
        ) : (
          <TransactionList
            cardProps={{ sx: { mt: 3 } }}
            title="Upcoming Transactions"
            noResultsMessage="You don't have any upcoming transactions"
            data={upcomingTransactions}
            onAddTransaction={() => setShowTransactionDrawer(true)}
          />
        )}
      </Grid>

      <CreateTransactionDrawer
        open={showTransactionDrawer}
        onChangeOpen={(isOpen) => setShowTransactionDrawer(isOpen)}
      />

      <CreateSubscriptionDrawer
        open={showSubscriptionDrawer}
        onChangeOpen={(isOpen) => setShowSubscriptionDrawer(isOpen)}
      />
    </React.Fragment>
  );
};

export default DashboardView;
