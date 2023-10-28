import React from 'react';
import { ActionPaper, Card } from '@/components/Base';
import { CategoryExpensesChartCard } from '@/components/Category';
import { CircularProgress, NoResults, Stats, StatsIconStyle, StatsProps } from '@/components/Core';
import { PageHeader } from '@/components/Layout';
import { Subscription as SubscriptionComponent } from '@/components/Subscription';
import { CreateSubscriptionDrawer } from '@/components/Subscription/CreateSubscriptionDrawer.component';
import { Transaction as TransactionComponent } from '@/components/Transaction';
import { CreateTransactionDrawer } from '@/components/Transaction';
import { AuthContext, StoreContext } from '@/context';
import { useFetchSubscriptions, useFetchTransactions } from '@/hook';
import { Subscription, Transaction } from '@/models';
import { BudgetService } from '@/services/Budget.service';
import { SubscriptionService } from '@/services/Subscription.service';
import { TransactionService } from '@/services/Transaction.service';
import { formatBalance } from '@/util';
import {
  AddRounded as AddIcon,
  BalanceRounded as BalanceIcon,
  RemoveRounded as MinusIcon,
  ScheduleSendRounded as ScheduleSendIcon,
} from '@mui/icons-material';
import { Grid, IconButton, Tooltip } from '@mui/material';

/** How many months do we wanna look back? */
const MONTH_BACKLOG = 6;

/** How many items do we wanna show? */
const LATEST_ITEMS = 6;

const DashboardRoute = () => {
  const { loading: loadingTransactions, transactions } = useFetchTransactions();
  const { loading: loadingSubscriptions, subscriptions } = useFetchSubscriptions();
  const { session } = React.useContext(AuthContext);
  const {
    loading,
    setLoading,
    transactions: storedTransactions,
    categoryExpenses,
    setCategoryExpenses,
    avgBalance,
    setAvgBalance,
  } = React.useContext(StoreContext);
  const [loadingCategoryExpenses, setLoadingCategoryExpenses] = React.useState(false);
  const [showAddTransactionForm, setShowAddTransactionForm] = React.useState(false);
  const [showAddSubscriptionForm, setShowAddSubscriptionForm] = React.useState(false);

  const WelcomeMsg = React.useMemo(() => {
    if (session && session.user && session.user.user_metadata.username) {
      return `Welcome, ${session.user.user_metadata.username}!`;
    } else return 'Welcome';
  }, [session?.user]);

  const latestTransactions: Transaction[] = React.useMemo(() => {
    return transactions
      .filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date())
      .slice(0, LATEST_ITEMS);
  }, [transactions]);

  const latestSubscriptions: Subscription[] = React.useMemo(() => {
    return subscriptions.filter((subscription) => !subscription.paused).slice(0, LATEST_ITEMS);
  }, [subscriptions]);

  const StatsCards: StatsProps[] = [
    {
      title: React.useMemo(
        () => formatBalance(TransactionService.calculateReceivedEarnings(transactions)),
        [transactions]
      ),
      subtitle: 'Earnings',
      icon: <AddIcon sx={StatsIconStyle} />,
      loading: loadingTransactions,
    },
    {
      title: React.useMemo(
        () => formatBalance(SubscriptionService.calculateUpcomingEarnings(subscriptions, transactions)),
        [subscriptions, transactions]
      ),
      subtitle: 'Earnings (upcoming)',
      icon: <ScheduleSendIcon sx={StatsIconStyle} />,
      loading: loadingSubscriptions || loadingTransactions,
    },
    {
      title: React.useMemo(() => formatBalance(TransactionService.calculatePaidExpenses(transactions)), [transactions]),
      subtitle: 'Expenses',
      icon: <MinusIcon sx={StatsIconStyle} />,
      loading: loadingTransactions,
    },
    {
      title: React.useMemo(
        () => formatBalance(SubscriptionService.calculateUpcomingExpenses(subscriptions, transactions)),
        [subscriptions, transactions]
      ),
      subtitle: 'Expenses (upcoming)',
      icon: <ScheduleSendIcon sx={StatsIconStyle} />,
      loading: loadingSubscriptions || loadingTransactions,
    },
    {
      title: React.useMemo(() => {
        const avg: number = avgBalance ?? 0;
        const income: number =
          TransactionService.calculateReceivedEarnings(transactions) +
          SubscriptionService.calculateUpcomingEarnings(subscriptions, transactions);
        const expenses: number =
          TransactionService.calculatePaidExpenses(transactions) +
          SubscriptionService.calculateUpcomingExpenses(subscriptions, transactions);
        const plannedBalance: number = income - expenses;

        /**
         * received income + upcoming income
         * -
         * already paid expenses + upcoming expenses
         *
         * Avg. of balance based on the past x months and current month expenses and income
         */
        const estBalance = (avg * 0.4 + plannedBalance * 0.6) / 2;
        // console.table({
        //     avg: avg,
        //     income: income,
        //     expenses: expenses,
        //     plannedBalance: plannedBalance,
        //     ohne: (avg + plannedBalance) / 2,
        //     mit: (avg * 0.4 + plannedBalance * 0.6) / 2,
        // });
        return formatBalance(estBalance);
      }, [avgBalance, transactions, subscriptions]),
      subtitle: 'Balance (estimated)',
      info: `Estimated balance based on the past ${MONTH_BACKLOG} months`,
      icon: <BalanceIcon sx={StatsIconStyle} />,
      loading: loading || loadingTransactions || loadingSubscriptions,
    },
    {
      title: React.useMemo(() => {
        const income: number =
          TransactionService.calculateReceivedEarnings(transactions) +
          SubscriptionService.calculateUpcomingEarnings(subscriptions, transactions);
        const expenses: number =
          TransactionService.calculatePaidExpenses(transactions) +
          SubscriptionService.calculateUpcomingExpenses(subscriptions, transactions);

        return formatBalance(income - expenses);
      }, [transactions, subscriptions]),
      subtitle: 'Balance',
      info: 'Calculated balance after deduction of all expenses from the income',
      icon: <BalanceIcon sx={StatsIconStyle} />,
      loading: loadingTransactions || loadingSubscriptions,
    },
  ];

  const fetchCategoryExpenses = () => {
    if (!session || !session.user) return;
    setLoadingCategoryExpenses(true);
    Promise.all([
      TransactionService.getCurrentMonthExpenses(session.user.id),
      TransactionService.getAllTimeExpenses(session.user.id),
    ])
      .then(([getCurrentMonthExpenses, getAllTimeExpenses]) => {
        setCategoryExpenses({
          type: 'UPDATE_ALL_DATA',
          allTime:
            getAllTimeExpenses !== null
              ? getAllTimeExpenses.map(({ category, sum }) => ({
                  label: category.name,
                  value: Math.abs(sum),
                }))
              : [],
          month:
            getCurrentMonthExpenses !== null
              ? getCurrentMonthExpenses.map(({ category, sum }) => ({
                  label: category.name,
                  value: Math.abs(sum),
                }))
              : [],
        });
      })
      .catch(console.error)
      .finally(() => setLoadingCategoryExpenses(false));
  };

  const fetchAvgBalance = () => {
    setLoading(true);
    return BudgetService.getMonthlyBalanceAvg(MONTH_BACKLOG)
      .then(setAvgBalance)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    if (!storedTransactions.fetched || !storedTransactions.data || storedTransactions.data.length < 1) return;
    fetchCategoryExpenses();
  }, [storedTransactions]);

  React.useEffect(() => {
    if (!session || !session.user) {
      setCategoryExpenses({ type: 'RESET' });
    } else {
      fetchCategoryExpenses();
      fetchAvgBalance();
    }
  }, []);

  return (
    <Grid container spacing={3}>
      <PageHeader title={WelcomeMsg} description="Everything but compressed" />

      <Grid container item columns={12} spacing={2}>
        {StatsCards.map((props, index, list) => {
          const xs = index + 1 === list.length && list.length % 2 > 0 ? 12 : 6;
          return (
            <Grid key={index} item xs={xs} md={2} lg={2}>
              <Stats {...props} />
            </Grid>
          );
        })}
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{ xs: 3, md: 1 }}>
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Your upcoming subscriptions</Card.Subtitle>
            </div>
            <Card.HeaderActions>
              <ActionPaper>
                <Tooltip title="Add Subscription">
                  <IconButton color="primary" onClick={() => setShowAddSubscriptionForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loadingSubscriptions ? (
              <CircularProgress />
            ) : latestSubscriptions.length > 0 ? (
              latestSubscriptions.map(({ id, categories, receiver, amount, execute_at }) => (
                <SubscriptionComponent
                  key={id}
                  title={receiver}
                  subtitle={[]}
                  category={categories}
                  executeAt={execute_at}
                  amount={amount}
                />
              ))
            ) : (
              <NoResults sx={{ mt: 2 }} text="No subscriptions found" />
            )}
          </Card.Body>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <CategoryExpensesChartCard
          loading={loadingCategoryExpenses}
          data={categoryExpenses}
          onChangeChart={(chart) => setCategoryExpenses({ type: 'CHANGE_CHART', chart: chart })}
        />
      </Grid>

      <Grid item xs={12} md={6} lg={4} order={{ xs: 2, md: 3 }}>
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Your latest transactions</Card.Subtitle>
            </div>
            <Card.HeaderActions>
              <ActionPaper>
                <Tooltip title="Add Transaction">
                  <IconButton color="primary" onClick={() => setShowAddTransactionForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loadingTransactions ? (
              <CircularProgress />
            ) : latestTransactions.length > 0 ? (
              latestTransactions.map(({ id, categories, receiver, amount, date }) => (
                <TransactionComponent
                  key={id}
                  title={receiver}
                  subtitle={[]}
                  category={categories}
                  date={new Date(date)}
                  amount={amount}
                />
              ))
            ) : (
              <NoResults sx={{ mt: 2 }} text="No transactions found" />
            )}
          </Card.Body>
        </Card>
      </Grid>

      <CreateTransactionDrawer open={showAddTransactionForm} setOpen={(show) => setShowAddTransactionForm(show)} />

      <CreateSubscriptionDrawer open={showAddSubscriptionForm} setOpen={(show) => setShowAddSubscriptionForm(show)} />
    </Grid>
  );
};

export default DashboardRoute;
