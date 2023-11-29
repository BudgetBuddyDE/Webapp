import { DashboardStatsWrapper } from '@/components/DashboardStatsWrapper.component';
import { ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { CircularProgress } from '@/components/Loading';
import { useAuthContext } from '@/core/Auth';
import { withAuthLayout } from '@/core/Auth/Layout';
import { BudgetProgressWrapper, useFetchBudgetProgress } from '@/core/Budget';
import { CategorySpendingsChart } from '@/core/Category';
import { SubscriptionList } from '@/core/Subscription';
import { useFetchSubscriptions } from '@/core/Subscription';
import { TransactionList, useFetchTransactions } from '@/core/Transaction';
import { CreateTransactionDrawer } from '@/core/Transaction/CreateTransactionDrawer.component';
import { TSubscription, TTransaction } from '@/types';
import { Grid } from '@mui/material';
import { useMemo, useState } from 'react';

export const Dashboard = () => {
  const { session } = useAuthContext();
  const { transactions, loading: loadingTransactions } = useFetchTransactions();
  const { subscriptions, loading: loadingSubscriptions } = useFetchSubscriptions();
  const { budgetProgress, loading: loadingBudgetProgress } = useFetchBudgetProgress();
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);

  const latestTransactions: TTransaction[] = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  const upcomingSubscriptions: TSubscription[] = useMemo(() => {
    // FIXME: Write function to sort by next upcoming subscriptions
    // FIXME: Don't show paused subscriptions
    return subscriptions.slice(0, 6);
  }, [subscriptions]);

  return (
    <ContentGrid title={`Welcome, ${session?.name}!`}>
      <DashboardStatsWrapper />

      <Grid item xs={12} md={6} lg={4} order={{ xs: 3, md: 1 }}>
        {loadingSubscriptions ? (
          <CircularProgress />
        ) : (
          <SubscriptionList data={upcomingSubscriptions} />
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

      <Grid item xs={12} md={6} lg={6} order={{ xs: 2, md: 3 }}>
        {loadingBudgetProgress ? (
          <CircularProgress />
        ) : (
          <BudgetProgressWrapper data={budgetProgress} />
        )}
      </Grid>

      <CreateTransactionDrawer
        open={showTransactionDrawer}
        onChangeOpen={(isOpen) => setShowTransactionDrawer(isOpen)}
      />

      <FabContainer>
        <OpenFilterDrawerFab />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Dashboard);
