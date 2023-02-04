import { Add as AddIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { Box, Grid, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { isSameMonth } from 'date-fns/esm';
import React from 'react';
import {
  ActionPaper,
  CircularProgress,
  CreateSubscription,
  CreateTransaction,
  IStatsProps,
  NoResults,
  PageHeader,
  PieChart,
  SpendingChartType,
  Stats,
  StatsIconStyle,
  Transaction,
} from '../components';
import Card from '../components/card.component';
import { AuthContext, StoreContext } from '../context';
import {
  BudgetService,
  DateService,
  ExpenseService,
  SubscriptionService,
  TransactionService,
} from '../services';
import type { IExpense, IExpenseTransactionDTO, IMonthlyBalanceAvg } from '../types';
import { addTransactionToExpenses, determineNextExecution, formatBalance } from '../utils';

/**
 * How many months do we wanna look back?
 */
export const MONTH_BACKLOG = 6;

export const Dashboard = () => {
  const SPENDING_CHART_TYPES: { type: SpendingChartType; text: string }[] = [
    {
      type: 'MONTH',
      text: DateService.shortMonthName() + '.',
    },
    { type: 'ALL', text: 'All' },
  ];
  const { session } = React.useContext(AuthContext);
  const { loading, setLoading, subscriptions, transactions } = React.useContext(StoreContext);
  const [chart, setChart] = React.useState<SpendingChartType>(SPENDING_CHART_TYPES[0].type);
  const [currentMonthExpenses, setCurrentMonthExpenses] = React.useState<IExpense[]>([]);
  const [allTimeExpenses, setAllTimeExpenses] = React.useState<IExpense[]>([]);
  const [monthlyAvg, setMonthlyAvg] = React.useState<IMonthlyBalanceAvg | null>(null);
  const [showAddTransactionForm, setShowAddTransactionForm] = React.useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = React.useState(false);

  const latestTransactions = React.useMemo(() => {
    return transactions
      .filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date())
      .slice(0, 6);
  }, [transactions]);

  const latestSubscriptions = React.useMemo(() => {
    return subscriptions.slice(0, 6);
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
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          SubscriptionService.getUpcomingSpendings(subscriptions) +
            TransactionService.getUpcomingSpendings(transactions)
        );
      }, [subscriptions, transactions]),
      subtitle: 'Upcoming expenses',
      info: 'Sum of transactions and subscriptions that have yet to be executed this month',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(TransactionService.getReceivedEarnings(transactions));
      }, [transactions]),
      subtitle: 'Received earnings',
      info: 'Sum of transactions and subscriptions that have been executed in favor of you',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          SubscriptionService.getUpcomingEarnings(subscriptions) +
            TransactionService.getUpcomingEarnings(transactions)
        );
      }, [subscriptions, transactions]),
      subtitle: 'Upcoming earnings',
      info: 'Sum of transactions and subscriptions that still have to be executed in favor of you',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(monthlyAvg ? monthlyAvg.avg : 0);
      }, [monthlyAvg]),
      subtitle: 'Estimated balance',
      info: `Estimated balance based on the past ${MONTH_BACKLOG} months`,
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: React.useMemo(() => {
        return formatBalance(
          TransactionService.getReceivedEarnings(transactions) -
            TransactionService.getPaidSpendings(transactions)
        );
      }, [transactions]),
      subtitle: 'Current balance',
      info: 'Calculated balance after deduction of all expenses from the income',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
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
        if (getCurrentMonthExpenses) {
          setCurrentMonthExpenses(getCurrentMonthExpenses);
        } else setCurrentMonthExpenses([]);

        if (getAllTimeExpenses) {
          setAllTimeExpenses(getAllTimeExpenses);
        } else setAllTimeExpenses([]);

        if (getMonthlyBalance) {
          setMonthlyAvg(getMonthlyBalance);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session, transactions]);

  return (
    <Grid container spacing={3}>
      <PageHeader
        title={`Welcome, ${
          (session && session.user && session.user.user_metadata.username) || 'Username'
        }!`}
        description="All in one page"
      />

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
            ) : subscriptions.length > 0 ? (
              latestSubscriptions.map(({ id, categories, receiver, amount, execute_at }) => (
                <Transaction
                  key={id}
                  category={categories.name}
                  date={determineNextExecution(execute_at)}
                  receiver={receiver}
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
                  value={chart}
                  onChange={(event: React.BaseSyntheticEvent) => setChart(event.target.value)}
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
                {chart === 'MONTH' ? (
                  <PieChart expenses={currentMonthExpenses} />
                ) : (
                  <PieChart expenses={allTimeExpenses} />
                )}
              </Box>
            )}
          </Card.Body>
        </Card>
      </Grid>

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
            {loading ? (
              <CircularProgress />
            ) : latestTransactions.length > 0 ? (
              latestTransactions.map(({ id, categories, receiver, amount, date }) => (
                <Transaction
                  key={id}
                  category={categories.name}
                  date={new Date(date)}
                  receiver={receiver}
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
          const expenseTransaction: IExpenseTransactionDTO = {
            sum: transaction.amount,
            category: {
              id: transaction.categories.id,
              name: transaction.categories.name,
              description: transaction.categories.description,
            },
            created_by: transaction.created_by || '', // TODO: Remove undefined
          };
          if (
            isSameMonth(new Date(transaction.date), new Date()) &&
            new Date(transaction.date) <= new Date()
          ) {
            addTransactionToExpenses(expenseTransaction, currentMonthExpenses, (updatedExpenses) =>
              setCurrentMonthExpenses(updatedExpenses)
            );
          }
          addTransactionToExpenses(expenseTransaction, allTimeExpenses, (updatedExpenses) =>
            setAllTimeExpenses(updatedExpenses)
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
