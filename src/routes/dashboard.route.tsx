import Grid from '@mui/material/Grid';
import { PageHeader } from '../components/page-header.component';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/auth.context';
import { Stats, StatsProps, StatsIconStyle } from '../components/stats-card.component';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Transaction, TransactionProps } from '../components/transaction.component';
import Card from '../components/card.component';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { PieChart } from '../components/spendings-chart.component';
import type { ICategory, IPaymentMethod, ITransaction } from '../types/transaction.interface';
import { DateService } from '../services/date.service';

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
  category: C1,
  paymentMethod: PM1,
  receiver: 'Penny',
  amount: -25.99,
  description: null,
  date: new Date(),
  created_at: new Date(),
};

export const T2: ITransaction = {
  id: 2,
  category: C2,
  paymentMethod: PM1,
  receiver: 'IKEA',
  amount: -45.99,
  description: null,
  date: new Date(),
  created_at: new Date(),
};

const StatsCards: StatsProps[] = [
  {
    title: '000.00 €',
    subtitle: 'Payed Subscriptions',
    icon: <ReceiptIcon sx={StatsIconStyle} />,
  },
  {
    title: '000.00 €',
    subtitle: 'Upcoming Payments',
    icon: <PaymentsIcon sx={StatsIconStyle} />,
  },
  {
    title: '000.00 €',
    subtitle: 'Upcoming Earnings',
    icon: <ScheduleIcon sx={StatsIconStyle} />,
  },
  {
    title: '000.00 €',
    subtitle: 'Received Earnings',
  },
];

const Subscriptions: TransactionProps[] = new Array(6).fill(
  {
    category: 'Finance Management',
    receiver: 'Budget-Buddy.de',
    amount: 10,
    date: new Date(),
  },
  0,
  6
);

const Transactions: TransactionProps[] = new Array(6).fill(
  {
    category: 'Finance Management',
    receiver: 'Budget-Buddy.de',
    amount: 10,
    date: new Date(),
  },
  0,
  6
);
/**
 * ./Mock Data
 */

export const Dashboard = () => {
  const { session } = useContext(AuthContext);
  const [chart, setChart] = useState<'MONTH' | 'ALL'>('MONTH');

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
            {Subscriptions.map((props, index) => (
              <Transaction key={index + props.date.getTime()} {...props} />
            ))}
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
            <Box sx={{ display: 'flex', flex: 1, mt: '1rem' }}>
              {chart === 'MONTH' ? (
                <PieChart transactions={[T1]} />
              ) : (
                <PieChart transactions={[T1, T2]} />
              )}
            </Box>
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
            {Transactions.map((props, index) => (
              <Transaction key={index + props.date.getTime()} {...props} />
            ))}
          </Card.Body>
        </Card>
      </Grid>
    </Grid>
  );
};
