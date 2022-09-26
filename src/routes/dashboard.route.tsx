import { useContext, useEffect, useMemo, useState } from 'react';
import { Grid, Box, Tooltip, IconButton, Button } from '@mui/material';
import {
  Payments as PaymentsIcon,
  Balance as BalanceIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/page-header.component';
import { AuthContext } from '../context/auth.context';
import { Stats, IStatsProps, StatsIconStyle } from '../components/stats-card.component';
import { Transaction } from '../components/transaction.component';
import Card from '../components/card.component';
import { PieChart } from '../components/charts/spendings-chart.component';
import type { IExpense } from '../types/transaction.interface';
import { DateService } from '../services/date.service';
import { determineNextExecution } from '../utils/determineNextExecution';
import { CircularProgress } from '../components/progress.component';
import { isSameMonth } from 'date-fns/esm';
import { StoreContext } from '../context/store.context';
import { ExpenseService } from '../services/expense.service';
import { addTransactionToExpenses } from '../utils/addTransactionToExpenses';
import { NoResults } from '../components/no-results.component';
import { CreateTransaction } from '../components/create-forms/create-transaction.component';
import { CreateSubscription } from '../components/create-forms/create-subscription.component';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';

export const Dashboard = () => {
  const { session } = useContext(AuthContext);
  const { loading, setLoading, subscriptions, transactions } = useContext(StoreContext);
  const [chart, setChart] = useState<'MONTH' | 'ALL'>('MONTH');
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<IExpense[]>([]);
  const [allTimeExpenses, setAllTimeExpenses] = useState<IExpense[]>([]);
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  const latestTransactions = useMemo(
    () =>
      transactions
        .filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date())
        .slice(0, 6),
    [transactions]
  );

  const StatsCards: IStatsProps[] = [
    {
      title: useMemo(
        () =>
          // TODO: Add getSpendings(subscriptions, transactioins) in order to calculate all planned subscriptions and future transactions which haven't been processed till today
          SubscriptionService.getPlannedSpendings(subscriptions).toLocaleString('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }),
        [subscriptions]
      ),
      subtitle: 'Planned Expenses',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(
        () =>
          SubscriptionService.getFuturePlannedSpendings(subscriptions, transactions).toLocaleString(
            'de-DE',
            { style: 'currency', currency: 'EUR' }
          ),
        [subscriptions, transactions]
      ),
      subtitle: 'Upcoming Expenses',
      icon: <PaymentsIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(
        () =>
          TransactionService.getCurrentMonthIncome(transactions).toLocaleString('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }),
        [transactions]
      ),
      subtitle: 'Received Earnings',
    },
    {
      title: useMemo(
        () =>
          SubscriptionService.getFuturePlannedIncome(subscriptions, transactions).toLocaleString(
            'de-DE',
            {
              style: 'currency',
              currency: 'EUR',
            }
          ),
        [subscriptions, transactions]
      ),
      subtitle: 'Upcoming Earnings',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(() => {
        const plannedIncome = SubscriptionService.getPlannedIncome(subscriptions);
        const moneySpend = TransactionService.getCurrentMonthSpendings(transactions);
        const futurePlannedPayments = SubscriptionService.getFuturePlannedSpendings(subscriptions);
        return (plannedIncome - (moneySpend + futurePlannedPayments)).toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
        });
      }, [subscriptions, transactions]),

      subtitle: 'Balance',
      icon: <BalanceIcon sx={StatsIconStyle} />,
    },
  ];

  useEffect(() => {
    setLoading(false);
    Promise.all([
      ExpenseService.getCurrentMonthExpenses(session!.user!.id),
      ExpenseService.getAllTimeExpenses(session!.user!.id),
    ])
      .then(([getCurrentMonthExpenses, getAllTimeExpenses]) => {
        if (getCurrentMonthExpenses) {
          setCurrentMonthExpenses(getCurrentMonthExpenses);
        } else setCurrentMonthExpenses([]);

        if (getAllTimeExpenses) {
          setAllTimeExpenses(getAllTimeExpenses);
        } else setAllTimeExpenses([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <Grid container spacing={3}>
      <PageHeader
        title={`Welcome, ${
          (session && session.user && session.user.email && session.user.email.split('@')[0]) ||
          'Username'
        }!`}
        description="All in one page"
      />

      <Grid container item columns={10} spacing={3}>
        {StatsCards.map((props, index, list) =>
          index + 1 === list.length && list.length % 2 > 0 ? (
            <Grid key={index} item xs={10} md={2} lg={2}>
              <Stats {...props} />
            </Grid>
          ) : (
            <Grid key={index} item xs={5} md={2} lg={2}>
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
              subscriptions
                .slice(0, 6)
                .map(({ id, categories, receiver, amount, execute_at }) => (
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
          if (
            isSameMonth(new Date(transaction.date), new Date()) &&
            new Date(transaction.date) <= new Date()
          ) {
            addTransactionToExpenses(transaction, currentMonthExpenses, (updatedExpenses) =>
              setCurrentMonthExpenses(updatedExpenses)
            );
          }
          addTransactionToExpenses(transaction, allTimeExpenses, (updatedExpenses) =>
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
