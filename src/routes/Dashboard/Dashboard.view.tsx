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

export const DashboardView = () => {
  const { transactions, loading: loadingTransactions } = useFetchTransactions();
  const { subscriptions, loading: loadingSubscriptions } = useFetchSubscriptions();
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const [showSubscriptionDrawer, setShowSubscriptionDrawer] = useState(false);

  const latestTransactions: TTransaction[] = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  const upcomingSubscriptions: TSubscription[] = useMemo(() => {
    return subscriptions.filter(({ paused }) => !paused).slice(0, 6);
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
            data={latestTransactions}
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
