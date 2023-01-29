import {
  Add as AddIcon,
  Balance as BalanceIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Box, Button, Grid, IconButton, Tooltip } from '@mui/material';
import { isSameMonth } from 'date-fns/esm';
import { useContext, useEffect, useMemo, useState } from 'react';
import Card from '../components/card.component';
import { PieChart } from '../components/charts/spendings-chart.component';
import { CreateSubscription } from '../components/create-forms/create-subscription.component';
import { CreateTransaction } from '../components/create-forms/create-transaction.component';
import { NoResults } from '../components/no-results.component';
import { PageHeader } from '../components/page-header.component';
import { CircularProgress } from '../components/progress.component';
import { IStatsProps, Stats, StatsIconStyle } from '../components/stats-card.component';
import { Transaction } from '../components/transaction.component';
import { AuthContext } from '../context/auth.context';
import { StoreContext } from '../context/store.context';
import { BudgetService } from '../services/budget.service';
import { DateService } from '../services/date.service';
import { ExpenseService } from '../services/expense.service';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';
import { supabase } from '../supabase';
import { IMonthlyBalanceAvg } from '../types/budget.type';
import type { IExpense } from '../types/transaction.interface';
import { IExpenseTransactionDTO } from '../types/transaction.type';
import { determineNextExecution } from '../utils/determineNextExecution';
import { formatBalance } from '../utils/formatBalance';
import { addTransactionToExpenses } from '../utils/transaction/addTransactionToExpenses';

/**
 * How many months do we wanna look back?
 */
export const MONTH_BACKLOG = 6;

export const Dashboard = () => {
  const { session } = useContext(AuthContext);
  const { loading, setLoading, subscriptions, transactions } = useContext(StoreContext);
  const [chart, setChart] = useState<'MONTH' | 'ALL'>('MONTH');
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<IExpense[]>([]);
  const [allTimeExpenses, setAllTimeExpenses] = useState<IExpense[]>([]);
  const [monthlyAvg, setMonthlyAvg] = useState<IMonthlyBalanceAvg | null>(null);
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  const latestTransactions = useMemo(() => {
    return transactions
      .filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date())
      .slice(0, 6);
  }, [transactions]);

  const latestSubscriptions = useMemo(() => {
    return subscriptions.slice(0, 6);
  }, [subscriptions]);

  const StatsCards: IStatsProps[] = [
    {
      // TODO: Create test to verify the result
      title: useMemo(() => {
        return formatBalance(SubscriptionService.getPlannedSpendings(subscriptions));
      }, [subscriptions, transactions]),
      subtitle: 'Planned expenses',
      info: 'Sum of transactions and subscriptions that will be executed this month',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: useMemo(() => {
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
      title: useMemo(() => {
        return formatBalance(TransactionService.getReceivedEarnings(transactions));
      }, [transactions]),
      subtitle: 'Received earnings',
      info: 'Sum of transactions and subscriptions that have been executed in favor of you',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: useMemo(() => {
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
      title: useMemo(() => {
        return formatBalance(monthlyAvg ? monthlyAvg.avg : 0);
      }, [monthlyAvg]),
      subtitle: 'Estimated balance',
      info: `Estimated balance based on the past ${MONTH_BACKLOG} months`,
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      // TODO: Create test to verify the result
      title: useMemo(() => {
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

  useEffect(() => {
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
  }, [session]);

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
              <Tooltip title="Add Subscription">
                <IconButton
                  aria-label="add-subscription"
                  onClick={() => setShowSubscriptionForm(true)}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
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
            <div>
              <Card.Title>Spendings</Card.Title>
              <Card.Subtitle>Categorized Spendings</Card.Subtitle>
            </div>
            <Card.HeaderActions>
              {[
                {
                  type: 'MONTH',
                  text: DateService.shortMonthName() + '.',
                  tooltip: DateService.getMonthFromDate(),
                  onClick: () => setChart('MONTH'),
                },
                { type: 'ALL', text: 'All', tooltip: 'All-Time', onClick: () => setChart('ALL') },
              ].map((button) => (
                <Tooltip key={button.text} title={button.tooltip}>
                  <Button
                    sx={{
                      color: (theme) => theme.palette.text.primary,
                      px: 1,
                      minWidth: 'unset',
                      backgroundColor: (theme) =>
                        chart === button.type ? theme.palette.action.focus : 'unset',
                    }}
                    onClick={button.onClick}
                  >
                    {button.text}
                  </Button>
                </Tooltip>
              ))}
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
            <div>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Your latest transactions</Card.Subtitle>
            </div>
            <Card.HeaderActions>
              <Tooltip title="Add Transaction">
                <IconButton
                  aria-label="add-transaction"
                  onClick={() => setShowAddTransactionForm(true)}
                >
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
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
