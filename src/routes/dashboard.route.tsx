import { Add as AddIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { isSameMonth } from 'date-fns/esm';
import React from 'react';
import {
  ActionPaper,
  Card,
  CircularProgress,
  CreateSubscription,
  CreateTransaction,
  IStatsProps,
  NoResults,
  PageHeader,
  PieChart,
  PieChartData,
  SpendingChartType,
  Stats,
  StatsIconStyle,
  Subscription,
  Transaction,
} from '../components';
import { AuthContext, StoreContext } from '../context';
import { Subscription as SubscriptionModel, Transaction as TransactionModel } from '../models';
import {
  BudgetService,
  DateService,
  ExpenseService,
  SubscriptionService,
  TransactionService,
} from '../services';
import type { IMonthlyBalanceAvg } from '../types';
import { addTransactionToExpenses, formatBalance } from '../utils';

/** How many months do we wanna look back? */
export const MONTH_BACKLOG = 6;

/** How many items do we wanna show? */
export const LATEST_ITEMS = 6;

export const Dashboard = () => {
  const SPENDING_CHART_TYPES: { type: SpendingChartType; text: string }[] = [
    {
      type: 'MONTH',
      text: DateService.shortMonthName() + '.',
    },
    { type: 'ALL', text: 'All' },
  ];
  const { session } = React.useContext(AuthContext);
  const { loading, setLoading, subscriptions, transactions, setTransactions } =
    React.useContext(StoreContext);
  const [categorySpendings, setCategorySpendings] = React.useReducer(categorySpendingsReducer, {
    chart: 'MONTH',
    month: [],
    allTime: [],
  });
  const [monthlyAvg, setMonthlyAvg] = React.useState<IMonthlyBalanceAvg | null>(null);
  const [showAddTransactionForm, setShowAddTransactionForm] = React.useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = React.useState(false);

  const latestTransactions: TransactionModel[] = React.useMemo(() => {
    if (!transactions.fetched) {
      // Fetch 'em & set em
      // After we've done that, the useMemo-hook will run again and should return the previous fetched rows
      // FIXME: Fetch me asynchronously
      TransactionService.getTransactions()
        .then((rows) => setTransactions({ type: 'FETCH_DATA', data: rows }))
        .catch(console.error);
      return [];
    }

    if (!transactions.data) return [];
    return transactions.data
      .filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date())
      .slice(0, LATEST_ITEMS);
  }, [transactions]);

  const latestSubscriptions: SubscriptionModel[] = React.useMemo(() => {
    return subscriptions.slice(0, LATEST_ITEMS);
  }, [subscriptions]);

  const StatsCards: IStatsProps[] = [
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(SubscriptionService.getPlannedSpendings(subscriptions));
      }, [subscriptions, transactions]),
      subtitle: 'Planned expenses',
      info: 'Sum of transactions and subscriptions that will be executed this month',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          SubscriptionService.getUpcomingSpendings(subscriptions) +
            TransactionService.getUpcomingSpendings(transactions.data ?? [])
        );
      }, [subscriptions, transactions]),
      subtitle: 'Upcoming expenses',
      info: 'Sum of transactions and subscriptions that have yet to be executed this month',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(TransactionService.getReceivedEarnings(transactions.data ?? []));
      }, [transactions]),
      subtitle: 'Received earnings',
      info: 'Sum of transactions and subscriptions that have been executed in favor of you',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          SubscriptionService.getUpcomingEarnings(subscriptions) +
            TransactionService.getUpcomingEarnings(transactions.data ?? [])
        );
      }, [subscriptions, transactions]),
      subtitle: 'Upcoming earnings',
      info: 'Sum of transactions and subscriptions that still have to be executed in favor of you',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(monthlyAvg ? monthlyAvg.avg : 0);
      }, [monthlyAvg]),
      subtitle: 'Estimated balance',
      info: `Estimated balance based on the past ${MONTH_BACKLOG} months`,
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          TransactionService.getReceivedEarnings(transactions.data ?? []) -
            TransactionService.getPaidSpendings(transactions.data ?? [])
        );
      }, [transactions]),
      subtitle: 'Current balance',
      info: 'Calculated balance after deduction of all expenses from the income',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
      loading: loading,
    },
  ];

  React.useEffect(() => {
    if (!session || !session.user) return;
    setLoading(true);
    Promise.all([
      ExpenseService.getCurrentMonthExpenses(session.user.id),
      ExpenseService.getAllTimeExpenses(session.user.id),
      BudgetService.getMonthlyBalanceAvg(MONTH_BACKLOG),
    ])
      .then(([getCurrentMonthExpenses, getAllTimeExpenses, getMonthlyBalance]) => {
        setCategorySpendings({
          type: 'UPDATE_ALL_DATA',
          month:
            getCurrentMonthExpenses !== null
              ? getCurrentMonthExpenses.map(({ category, sum }) => ({
                  label: category.name,
                  value: Math.abs(sum),
                }))
              : [],
          allTime:
            getAllTimeExpenses !== null
              ? getAllTimeExpenses.map(({ category, sum }) => ({
                  label: category.name,
                  value: Math.abs(sum),
                }))
              : [],
        });

        if (getMonthlyBalance) {
          setMonthlyAvg(getMonthlyBalance);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <Grid container spacing={3}>
      <PageHeader
        title={`Welcome, ${
          (session && session.user && session.user.user_metadata.username) || 'Username'
        }!`}
        description="All in one page"
      />

      {/* Stats */}
      <Grid container item columns={12} spacing={3}>
        {StatsCards.map((props, index, list) =>
          index + 1 === list.length && list.length % 2 > 0 ? (
            <Grid key={index} item xs={12} md={2} lg={2}>
              <Stats {...props} />
            </Grid>
          ) : (
            <Grid key={index} item xs={6} md={2} lg={2}>
              <Stats {...props} />
            </Grid>
          )
        )}
      </Grid>

      {/* Subscriptions */}
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
                  <IconButton onClick={() => setShowSubscriptionForm(true)} color="primary">
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : latestSubscriptions.length > 0 ? (
              latestSubscriptions.map(({ id, categories, receiver, amount, execute_at }) => (
                <Subscription
                  key={id}
                  title={receiver}
                  subtitle={categories.name}
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

      {/* Spendings chart */}
      <Grid item xs={12} md={6} lg={4} order={{ xs: 1, md: 2 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Spendings</Card.Title>
              <Card.Subtitle>Categorized Spendings</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  value={categorySpendings.chart}
                  onChange={(event: React.BaseSyntheticEvent) =>
                    setCategorySpendings({ type: 'CHANGE_CHART', chart: event.target.value })
                  }
                  exclusive
                >
                  {SPENDING_CHART_TYPES.map((button) => (
                    <ToggleButton key={button.type} value={button.type}>
                      {button.text}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: 'flex', flex: 1, mt: '1rem' }}>
                <ParentSize>
                  {({ width }) => (
                    <PieChart
                      width={width}
                      height={width}
                      data={
                        categorySpendings.chart === 'MONTH'
                          ? categorySpendings.month
                          : categorySpendings.allTime
                      }
                      formatAsCurrency
                      showTotalSum
                    />
                  )}
                </ParentSize>
              </Box>
            )}
          </Card.Body>
        </Card>
      </Grid>

      {/* Transactions */}
      <Grid item xs={12} md={6} lg={4} order={{ xs: 2, md: 3 }}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Your latest transactions</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper>
                <Tooltip title="Add Transaction">
                  <IconButton onClick={() => setShowAddTransactionForm(true)} color="primary">
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading && !transactions.fetched ? (
              <CircularProgress />
            ) : latestTransactions.length > 0 ? (
              latestTransactions.map(({ id, categories, receiver, amount, date }) => (
                <Transaction
                  key={id}
                  title={receiver}
                  subtitle={categories.name}
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

      <CreateTransaction
        open={showAddTransactionForm}
        setOpen={(show) => setShowAddTransactionForm(show)}
        afterSubmit={(transaction) => {
          const forCurrentMonth =
            isSameMonth(new Date(transaction.date), new Date()) &&
            new Date(transaction.date) <= new Date();

          addTransactionToExpenses(
            transaction,
            forCurrentMonth ? categorySpendings.month : categorySpendings.allTime,
            (updatedExpenses) =>
              setCategorySpendings(
                forCurrentMonth
                  ? {
                      type: 'UPDATE_MONTH_DATA',
                      month: updatedExpenses,
                    }
                  : {
                      type: 'UPDATE_ALL_TIME_DATA',
                      allTime: updatedExpenses,
                    }
              )
          );
        }}
      />

      <CreateSubscription
        open={showSubscriptionForm}
        setOpen={(show) => setShowSubscriptionForm(show)}
      />
    </Grid>
  );
};

export type CategorySpendingsState = {
  chart: 'MONTH' | 'ALL_TIME';
  month: PieChartData[];
  allTime: PieChartData[];
};

export type CategorySpendingsAction =
  | { type: 'CHANGE_CHART'; chart: CategorySpendingsState['chart'] }
  | { type: 'UPDATE_MONTH_DATA'; month: CategorySpendingsState['month'] }
  | { type: 'UPDATE_ALL_TIME_DATA'; allTime: CategorySpendingsState['allTime'] }
  | {
      type: 'UPDATE_ALL_DATA';
      allTime: CategorySpendingsState['allTime'];
      month: CategorySpendingsState['month'];
    };

export function categorySpendingsReducer(
  state: CategorySpendingsState,
  action: CategorySpendingsAction
): CategorySpendingsState {
  switch (action.type) {
    case 'CHANGE_CHART':
      return { ...state, chart: action.chart };

    case 'UPDATE_MONTH_DATA':
      return { ...state, month: action.month };

    case 'UPDATE_ALL_TIME_DATA':
      return { ...state, allTime: action.allTime };

    case 'UPDATE_ALL_DATA':
      return { ...state, month: action.month, allTime: action.allTime };

    default:
      throw new Error('Trying to execute unknown action');
  }
}
