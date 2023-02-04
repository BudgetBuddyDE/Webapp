import { Add as AddIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import React from 'react';
import {
  ActionPaper,
  AreaChart,
  Card,
  CategoryBudget,
  CategoryBudgetProps,
  CircularProgress,
  CreateBudget,
  EditBudget,
  IDailyTransaction,
  IStatsProps,
  NoResults,
  PageHeader,
  Stats,
  Transaction,
} from '../components';
import { AuthContext, SnackbarContext, StoreContext } from '../context';
import { useScreenSize } from '../hooks';
import { Budget as BudgetModel } from '../models';
import {
  ExpenseService,
  IncomeService,
  SubscriptionService,
  TransactionService,
} from '../services';
import type { IExpense, IIncome } from '../types';
import { getFirstDayOfMonth } from '../utils';

export type ChartContentType = 'INCOME' | 'SPENDINGS';

export const ChartContentTypes = [
  { type: 'INCOME' as ChartContentType, label: 'Income' },
  { type: 'SPENDIGNS' as ChartContentType, label: 'Spendings' },
];

export const Budget = () => {
  const screenSize = useScreenSize();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactions, subscriptions, budget, setBudget } =
    React.useContext(StoreContext);
  const [chart, setChart] = React.useState<ChartContentType>('INCOME');
  const [dateRange, setDateRange] = React.useState({ from: getFirstDayOfMonth(), to: new Date() });
  const [dailyIncome, setDailyIncome] = React.useState<IDailyTransaction[]>([]);
  const [income, setIncome] = React.useState<IIncome[]>([]);
  const [dailyExpenses, setDailyExpenses] = React.useState<IDailyTransaction[]>([]);
  const [expenses, setExpenses] = React.useState<IExpense[]>([]);
  const [showAddBudgetForm, setShowAddBudgetForm] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const [editBudget, setEditBudget] = React.useState<BudgetModel | null>(null);

  const handler: {
    onBudgetEdit: CategoryBudgetProps['onEdit'];
    onBudgetDelete: CategoryBudgetProps['onDelete'];
  } = {
    onBudgetEdit: (budget) => {},
    onBudgetDelete: async (deleteBudget) => {
      try {
        const deletedBudgets = await deleteBudget;
        if (!deletedBudgets || deletedBudgets.length < 1) throw new Error('No budget deleted');
        startTransition(() => {
          setBudget((prev) => prev.filter(({ id }) => id !== deletedBudgets[0].id));
        });
        showSnackbar({ message: `Budget deleted` });
      } catch (error) {
        console.error(error);
        showSnackbar({
          // @ts-ignore
          message: error.message || "Could'nt delete the budget",
          action: deleteBudget ? (
            // @ts-ignore
            <Button onClick={() => handler.onBudgetDelete(deleteBudget)}>Retry</Button>
          ) : undefined, // TODO: Fixme
        });
      }
    },
  };

  const handleBudgetDelete = async (budget: BudgetModel) => {};

  // TODO: Calculate stats in SQL and return them using a view or an RPC
  const StatsCalculations = {
    plannedIncome: React.useMemo(
      () => SubscriptionService.getPlannedIncome(subscriptions),
      [subscriptions]
    ),
    // totalPlannedIncome: useMemo(() => {
    //   const receivedMoney = TransactionService.getReceivedEarnings(transactions);
    //   const plannedIncome = SubscriptionService.getUpcomingEarnings(subscriptions);
    //   return receivedMoney + plannedIncome;
    // }, [transactions, subscriptions]),
    plannedSpendings: React.useMemo(
      () => SubscriptionService.getPlannedSpendings(subscriptions),
      [subscriptions]
    ),
    totalPlannedSpendings: React.useMemo(() => {
      const moneySpend = TransactionService.getPaidSpendings(transactions);
      const futurePlannedPayments = SubscriptionService.getUpcomingSpendings(subscriptions);
      return moneySpend + futurePlannedPayments;
    }, [transactions, subscriptions]),
    moneyLeft: React.useMemo(() => {
      const plannedIncome = SubscriptionService.getPlannedIncome(subscriptions);
      const moneySpend = TransactionService.getPaidSpendings(transactions);
      const futurePlannedPayments = SubscriptionService.getUpcomingSpendings(subscriptions);
      return plannedIncome - (moneySpend + futurePlannedPayments);
    }, [transactions, subscriptions]),
  };

  const StatsCards: IStatsProps[] = [
    {
      title: StatsCalculations.plannedIncome.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Income',
      info: 'Your monthly income based on your subscriptions.',
    },
    {
      title: StatsCalculations.plannedSpendings.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Subscriptions',
      info: 'Your planned monthly payments.',
    },
    {
      title: StatsCalculations.totalPlannedSpendings.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Expenses',
      info: 'Planned montly payments and current month total spendings.',
    },
    {
      title: StatsCalculations.moneyLeft.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Balance',
      info: 'Balance after subtracting your subscriptions and payments from your income.',
    },
  ];

  React.useEffect(() => {
    Promise.all([
      IncomeService.getIncome(session!.user!.id, dateRange.from, dateRange.to),
      IncomeService.getDailyIncome(session!.user!.id, dateRange.from, dateRange.to),
      ExpenseService.getExpenses(session!.user!.id, dateRange.from, dateRange.to),
      ExpenseService.getDailyExpenses(session!.user!.id, dateRange.from, dateRange.to),
    ])
      .then(async ([getIncome, getDailyIncome, getExpenses, getDailyExpenses]) => {
        if (getIncome) {
          setIncome(getIncome);
        } else setIncome([]);

        if (getDailyIncome) {
          setDailyIncome(getDailyIncome);
        } else setDailyIncome([]);

        if (getExpenses) {
          setExpenses(getExpenses);
        } else setExpenses([]);

        if (getDailyExpenses) {
          setDailyExpenses(getDailyExpenses);
        } else setDailyExpenses([]);
      })
      .catch((error) => console.error(error));
  }, [session, dateRange]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Budget" description="How much did u spent this month?" />

      <Grid item xs={12} md={12} lg={5} xl={5}>
        <Card>
          <Card.Header sx={{ mb: 2 }}>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>
                {chart === 'INCOME' ? 'Income' : 'Spendings'} grouped by their category!
              </Card.Subtitle>
            </Box>

            <Card.HeaderActions>
              <ActionPaper>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  value={chart}
                  onChange={(event: React.BaseSyntheticEvent) =>
                    setChart(event.target.value as ChartContentType)
                  }
                  exclusive
                >
                  {ChartContentTypes.map((button) => (
                    <ToggleButton value={button.type}>{button.label}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Header>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {screenSize === 'small' ? (
                  <MobileDatePicker
                    label="From"
                    inputFormat="dd.MM"
                    value={dateRange.from}
                    onChange={(date: Date | null) => {
                      setDateRange((prev) => ({ ...prev, from: date || new Date() }));
                    }}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                ) : (
                  <DesktopDatePicker
                    label="From"
                    inputFormat="dd.MM"
                    value={dateRange.from}
                    onChange={(date: Date | null) => {
                      setDateRange((prev) => ({ ...prev, from: date || new Date() }));
                    }}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                )}

                {screenSize === 'small' ? (
                  <MobileDatePicker
                    label="To"
                    inputFormat="dd.MM"
                    value={dateRange.to}
                    onChange={(date: Date | null) => {
                      setDateRange((prev) => ({ ...prev, to: date || new Date() }));
                    }}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                ) : (
                  <DesktopDatePicker
                    label="To"
                    inputFormat="dd.MM"
                    value={dateRange.to}
                    onChange={(date: Date | null) => {
                      setDateRange((prev) => ({ ...prev, to: date || new Date() }));
                    }}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                )}
              </LocalizationProvider>
            </Box>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: 'flex', flex: 1, mt: '1rem' }}>
                {chart === 'INCOME' ? (
                  <ParentSize>
                    {({ width }) => (
                      <AreaChart width={width} height={width * 0.6} data={dailyIncome} />
                    )}
                  </ParentSize>
                ) : (
                  <ParentSize>
                    {({ width }) => (
                      <AreaChart width={width} height={width * 0.6} data={dailyExpenses} />
                    )}
                  </ParentSize>
                )}
              </Box>
            )}

            <Divider sx={{ mt: 2 }} />

            {loading ? (
              <CircularProgress />
            ) : chart === 'INCOME' ? (
              income.length > 0 ? (
                income.map(({ category, sum }) => (
                  <Transaction
                    key={category.id}
                    category={category.name}
                    date={category.description || 'No description'}
                    amount={sum}
                  />
                ))
              ) : (
                <NoResults sx={{ mt: 2 }} text="No results for the timespan" />
              )
            ) : expenses.length > 0 ? (
              expenses.map(({ category, sum }) => (
                <Transaction
                  key={category.id}
                  category={category.name}
                  date={category.description || 'No description'}
                  amount={Math.abs(sum)}
                />
              ))
            ) : (
              <NoResults sx={{ mt: 2 }} text="No results for the timespan" />
            )}
          </Card.Body>
        </Card>
      </Grid>

      <Grid item xs={12} md={12} lg={7} xl={7}>
        <Grid item container spacing={3}>
          {StatsCards.map((props) => (
            <Grid key={props.title + props.subtitle} item xs={6} md={3} lg={3}>
              <Stats {...props} />
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 2 }}>
          <Card.Header>
            <Box>
              <Card.Title>Category Budgets</Card.Title>
              <Card.Subtitle>Set a limit for your spending</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper>
                <Tooltip title="Set Budget">
                  <IconButton color="primary" onClick={() => setShowAddBudgetForm(true)}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : budget.length > 0 ? (
              budget.map((item) => <CategoryBudget budget={item} />)
            ) : (
              <NoResults sx={{ mt: 2 }} text="No budget found" />
            )}
          </Card.Body>
        </Card>
      </Grid>

      <CreateBudget open={showAddBudgetForm} setOpen={(show) => setShowAddBudgetForm(show)} />

      <EditBudget
        open={editBudget !== null}
        setOpen={(show) => {
          if (!show) setEditBudget(null);
        }}
        budget={editBudget}
      />
    </Grid>
  );
};
