import { useContext, useEffect, useMemo, useState } from 'react';
import { Grid, Tooltip, IconButton, Button, Box } from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/page-header.component';
import { AuthContext } from '../context/auth.context';
import { Stats, StatsProps, StatsIconStyle } from '../components/stats-card.component';
import { Transaction } from '../components/transaction.component';
import Card from '../components/card.component';
import { PieChart } from '../components/spendings-chart.component';
import type {
  IExpense,
  ICategory,
  IPaymentMethod,
  ISubscription,
  ITransaction,
} from '../types/transaction.interface';
import { DateService } from '../services/date.service';
import { determineNextExecution, getSubscriptions } from '../routes/subscriptions.route';
import { getTransactions } from '../routes/transactions.route';
import { supabase } from '../supabase';
import { CircularProgress } from '../components/progress.component';
import { isSameMonth } from 'date-fns/esm';

/**
 * Mock Data
 */
const PM1: IPaymentMethod = {
  id: 1,
  name: 'PayPal N26 (Hauptkonto)',
  provider: 'PayPal',
  address: 'DE-IBAN',
  description: null,
};

const C1: ICategory = {
  id: 1,
  name: 'Lebensmittel',
  description: null,
};

const C2: ICategory = {
  id: 2,
  name: 'Haushalt',
  description: null,
};

export const T1: ITransaction = {
  id: 1,
  categories: C1,
  paymentMethods: PM1,
  receiver: 'Penny',
  amount: -25.99,
  description: null,
  date: new Date(),
};

export const T2: ITransaction = {
  id: 2,
  categories: C2,
  paymentMethods: PM1,
  receiver: 'IKEA',
  amount: -45.99,
  description: null,
  date: new Date(),
};
/**
 * ./Mock Data
 */

export const Dashboard = () => {
  const { session } = useContext(AuthContext);
  const [chart, setChart] = useState<'MONTH' | 'ALL'>('MONTH');
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<IExpense[]>([]);
  const [allTimeExpenses, setAllTimeExpenses] = useState<IExpense[]>([]);

  const StatsCards: StatsProps[] = [
    {
      title: useMemo(
        () =>
          Math.abs(
            subscriptions
              .filter(
                (subscription) =>
                  subscription.amount < 0 && subscription.execute_at <= new Date().getDate()
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
        [subscriptions]
      ),
      subtitle: 'Payed Subscriptions',
      icon: <ReceiptIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(
        () =>
          Math.abs(
            subscriptions
              .filter(
                (subscription) =>
                  subscription.amount < 0 && subscription.execute_at > new Date().getDate()
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
        [subscriptions]
      ).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
      subtitle: 'Upcoming Payments',
      icon: <PaymentsIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(
        () =>
          Math.abs(
            subscriptions
              .filter(
                (subscription) =>
                  subscription.amount > 0 && subscription.execute_at > new Date().getDate()
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
        [subscriptions]
      ).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
      subtitle: 'Upcoming Earnings',
      icon: <ScheduleIcon sx={StatsIconStyle} />,
    },
    {
      title: useMemo(
        () =>
          Math.abs(
            transactions
              .filter(
                (transaction) =>
                  transaction.amount > 0 && isSameMonth(new Date(transaction.date), new Date())
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
        [transactions]
      ).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
      subtitle: 'Received Earnings',
    },
  ];

  useEffect(() => {
    Promise.all([
      getSubscriptions(),
      getTransactions(),
      supabase
        .from<IExpense>('CurrentMonthExpenses')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id),
      supabase
        .from<IExpense>('AllTimeExpenses')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id),
    ])
      .then(([getSubscriptions, getTransactions, getCurrentMonthExpenses, getAllTimeExpenses]) => {
        if (getSubscriptions) {
          setSubscriptions(getSubscriptions);
        } else setSubscriptions([]);

        if (getTransactions) {
          setTransactions(getTransactions);
        } else setTransactions([]);

        if (getCurrentMonthExpenses.data) {
          setCurrentMonthExpenses(getCurrentMonthExpenses.data);
        } else setCurrentMonthExpenses([]);

        if (getAllTimeExpenses.data) {
          setAllTimeExpenses(getAllTimeExpenses.data);
        } else setAllTimeExpenses([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  return (
    <Grid container spacing={3}>
      <PageHeader
        title={`Welcome, ${
          (session && session.user && session.user.email && session.user.email.split('@')[0]) ||
          'Username'
        }!`}
        description="All in one page"
      />

      {StatsCards.map((props) => (
        <Grid item xs={6} md={6} lg={3}>
          <Stats {...props} />
        </Grid>
      ))}

      <Grid item xs={12} md={6} lg={4} order={{ xs: 3, md: 1 }}>
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Your upcoming subscriptions</Card.Subtitle>
            </div>
            <Card.HeaderActions>
              <Tooltip title="Add Subscription">
                <IconButton aria-label="add-subscription">
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
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
                <IconButton aria-label="add-transaction">
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
              transactions
                .filter(({ date }) => new Date(date) <= new Date())
                .slice(0, 6)
                .map(({ id, categories, receiver, amount, date }, index) => (
                  <Transaction
                    key={id}
                    category={categories.name}
                    date={new Date(date)}
                    receiver={receiver}
                    amount={amount}
                  />
                ))
            )}
          </Card.Body>
        </Card>
      </Grid>
    </Grid>
  );
};
