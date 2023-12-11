import { DashboardStatsWrapper } from '@/components/DashboardStatsWrapper.component';
import { ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { CircularProgress } from '@/components/Loading';
import { useAuthContext } from '@/core/Auth';
import { withAuthLayout } from '@/core/Auth/Layout';
import { CategorySpendingsChart } from '@/core/Category';
import { CreateSubscriptionDrawer, SubscriptionList } from '@/core/Subscription';
import { useFetchSubscriptions } from '@/core/Subscription';
import { TransactionList, useFetchTransactions } from '@/core/Transaction';
import { CreateTransactionDrawer } from '@/core/Transaction/CreateTransactionDrawer.component';
import { TSubscription, TTransaction } from '@/types';
import { Grid } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';

export const Dashboard = () => {
  const { session } = useAuthContext();
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

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch('https://test.backend.budget-buddy.de/test', {
          headers: {
            Authorization: 'Bearer DEMO_TOKEN',
          },
        });
        const json = await response.json();
        console.log(json);
      } catch (err) {
        console.error(err);
      }
    };

    getData();
  }, []);

  return (
    <ContentGrid title={`Welcome, ${session?.name}!`}>
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

      <FabContainer>
        <OpenFilterDrawerFab />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Dashboard);
