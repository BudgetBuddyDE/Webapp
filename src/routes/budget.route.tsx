import { ChangeEvent, FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Box,
  Button,
  TextField,
  Tooltip,
  IconButton,
  Alert,
  AlertTitle,
  Autocomplete,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { format, isSameMonth } from 'date-fns';
import Card from '../components/card.component';
import { PageHeader } from '../components/page-header.component';
import { AuthContext } from '../context/auth.context';
import { supabase } from '../supabase';
import { IExpense, IIncome } from '../types/transaction.interface';
import { StoreContext } from '../context/store.context';
import { CircularProgress } from '../components/progress.component';
import { Transaction } from '../components/transaction.component';
import AreaChart, { IDailyTransaction } from '../components/area-chart.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { getFirstDayOfMonth } from '../utils/getFirstDayOfMonth';
import { CategoryBudget } from '../components/category-budget.component';
import { FormDrawer } from '../components/form-drawer.component';
import { BudgetService } from '../services/budget.service';
import { transformBalance } from '../utils/transformBalance';
import { SnackbarContext } from '../context/snackbar.context';
import { IBudget } from '../types/budget.interface';
import { Stats, StatsProps } from '../components/stats-card.component';

type ChartContent = 'INCOME' | 'SPENDINGS';

export const Budget = () => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, setLoading, transactions, subscriptions, categories } = useContext(StoreContext);
  const [chart, setChart] = useState<ChartContent>('INCOME');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: getFirstDayOfMonth(),
    to: new Date(),
  });
  const [dailyMonthIncome, setDailyMonthIncome] = useState<IDailyTransaction[]>([]);
  const [currentMonthIncome, setCurrentMonthIncome] = useState<IIncome[]>([]);
  const [dailyMonthExpense, setDailyMonthExpense] = useState<IDailyTransaction[]>([]);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<IExpense[]>([]);
  const [budget, setBudget] = useState<IBudget[]>([]);
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [addBudgetForm, setAddBudgetForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const budgetFormHandler = {
    open: () => setShowAddBudgetForm(true),
    close: () => {
      setShowAddBudgetForm(false);
      setAddBudgetForm({});
      setErrorMessage('');
    },
    autocompleteChange: (event: React.SyntheticEvent<Element, Event>, value: string | number) => {
      setAddBudgetForm((prev) => ({ ...prev, category: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddBudgetForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(addBudgetForm);
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('budget')) throw new Error('Provide an payment method');
        const data = await BudgetService.create([
          {
            category: Number(addBudgetForm.category),
            budget: transformBalance(addBudgetForm.budget.toString()),
            // @ts-ignore
            created_by: session.user.id,
          },
        ]);
        if (data === null) throw new Error('No budget saved');
        // setBudget((prev) => [
        //   ...prev,
        //   {
        //     ...data[0],
        //     categories: categories.find((value) => value.id === data[0].category),
        //     paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
        //   } as ISubscription,
        // ]);
        budgetFormHandler.close();
        showSnackbar({
          message: `Budget for category '${addBudgetForm.category}' saved`,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from<IIncome>('CurrentMonthIncome')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id),
      supabase
        .from<IIncome>('CurrentMonthExpenses')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id),
      BudgetService.getBudget(session?.user?.id!),
    ])
      .then(([getCurrentMonthIncome, getCurrentMonthExpenses, getUserBudget]) => {
        if (getCurrentMonthIncome.data) {
          setCurrentMonthIncome(getCurrentMonthIncome.data);
        } else setCurrentMonthIncome([]);

        if (getCurrentMonthExpenses.data) {
          setCurrentMonthExpenses(getCurrentMonthExpenses.data);
        } else setCurrentMonthExpenses([]);

        if (getUserBudget) {
          setBudget(getUserBudget);
        } else setBudget([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase
        .from<IDailyTransaction>('DailyIncome')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id)
        .gte('date', format(new Date(dateRange.from), 'yyyy/MM/dd'))
        .lte('date', format(new Date(dateRange.to), 'yyyy/MM/dd')),
      supabase
        .from<IDailyTransaction>('DailyExpense')
        .select('*')
        // @ts-ignore
        .eq('created_by', session?.user?.id)
        .gte('date', format(new Date(dateRange.from), 'yyyy/MM/dd'))
        .lte('date', format(new Date(dateRange.to), 'yyyy/MM/dd')),
    ])
      .then(([getDailyIncome, getDailyExpense]) => {
        if (getDailyIncome.data) {
          setDailyMonthIncome(getDailyIncome.data);
        } else setDailyMonthIncome([]);

        if (getDailyExpense.data) {
          setDailyMonthExpense(getDailyExpense.data);
        } else setDailyMonthExpense([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session?.user?.id, dateRange]);

  const CategoryButtons = () => (
    <Card.HeaderActions>
      {[
        { type: 'INCOME', label: 'Income' },
        { type: 'SPENDIGNS', label: 'Spendings' },
      ].map((btn) => (
        <Button
          sx={{
            color: (theme) => theme.palette.text.primary,
            px: 1,
            minWidth: 'unset',
            backgroundColor: (theme) => (chart === btn.type ? theme.palette.action.focus : 'unset'),
          }}
          onClick={() => setChart(btn.type as ChartContent)}
        >
          {btn.label}
        </Button>
      ))}
    </Card.HeaderActions>
  );

  const StatsCalculations: { income: number; spendings: number } = {
    income: useMemo(
      () =>
        Math.abs(
          transactions
            .filter(
              (transaction) =>
                transaction.amount > 0 &&
                isSameMonth(new Date(transaction.date), new Date()) &&
                new Date(transaction.date) <= new Date()
            )
            .reduce((prev, cur) => prev + cur.amount, 0)
        ),
      [transactions]
    ),
    spendings: useMemo(
      () =>
        Math.abs(
          transactions
            .filter(
              (transaction) =>
                transaction.amount < 0 &&
                isSameMonth(new Date(transaction.date), new Date()) &&
                new Date(transaction.date) <= new Date()
            )
            .reduce((prev, cur) => prev + cur.amount, 0)
        ),
      [transactions]
    ),
  };

  const StatsCards: StatsProps[] = [
    {
      title: StatsCalculations.income.toLocaleString('de', { style: 'currency', currency: 'EUR' }),
      subtitle: 'Income',
    },
    {
      title: StatsCalculations.spendings.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Spendings',
    },
    {
      title: subscriptions
        .filter((subscription) => subscription.amount > 0)
        .reduce((prev, cur) => prev + cur.amount, 0)
        .toLocaleString('de', {
          style: 'currency',
          currency: 'EUR',
        }),
      subtitle: 'Expected Income (Budget)',
    },
    {
      title: (StatsCalculations.income - StatsCalculations.spendings).toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Balance',
    },
  ];

  // const TimeRangeStatsCard: StatsProps[] = [
  //   {
  //     title: useMemo(
  //       () => dailyMonthIncome.reduce((prev, cur) => prev + cur.sum, 0),
  //       [dailyMonthIncome]
  //     ).toLocaleString('de', {
  //       style: 'currency',
  //       currency: 'EUR',
  //     }),
  //     subtitle: 'Income',
  //   },
  //   {
  //     title: useMemo(
  //       () => Math.abs(dailyMonthExpense.reduce((prev, cur) => prev + cur.sum, 0)),
  //       [dailyMonthExpense]
  //     ).toLocaleString('de', {
  //       style: 'currency',
  //       currency: 'EUR',
  //     }),
  //     subtitle: 'Spendings',
  //   },
  //   {
  //     title: subscriptions
  //       .filter((subscription) => subscription.amount > 0)
  //       .reduce((prev, cur) => prev + cur.amount, 0)
  //       .toLocaleString('de', {
  //         style: 'currency',
  //         currency: 'EUR',
  //       }),
  //     subtitle: 'Expected Income (Budget)',
  //   },
  //   {
  //     title: useMemo(
  //       () =>
  //         dailyMonthIncome.reduce((prev, cur) => prev + cur.sum, 0) -
  //         Math.abs(dailyMonthExpense.reduce((prev, cur) => prev + cur.sum, 0)),
  //       [dailyMonthIncome, dailyMonthExpense]
  //     ).toLocaleString('de', {
  //       style: 'currency',
  //       currency: 'EUR',
  //     }),
  //     subtitle: 'Balance',
  //   },
  // ];

  return (
    <Grid container spacing={3}>
      <PageHeader title="Budget" description="How much did u spent this month?" />

      <Grid item xs={12} md={12} lg={5} xl={4}>
        <Card sx={{ mb: 2 }}>
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
            <CategoryButtons />
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: 'flex', flex: 1, mt: '1rem' }}>
                {chart === 'INCOME' ? (
                  <ParentSize>
                    {({ width }) => (
                      <AreaChart width={width} height={width * 0.6} data={dailyMonthIncome} />
                    )}
                  </ParentSize>
                ) : (
                  <ParentSize>
                    {({ width }) => (
                      <AreaChart width={width} height={width * 0.6} data={dailyMonthExpense} />
                    )}
                  </ParentSize>
                )}
              </Box>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>
                {chart === 'INCOME' ? 'Income' : 'Spendings'} grouped by their category!
              </Card.Subtitle>
            </Box>
            <CategoryButtons />
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : chart === 'INCOME' ? (
              currentMonthIncome.map(({ category, sum }) => (
                <Transaction
                  key={category.id}
                  category={category.name}
                  date={category.description || 'No description'}
                  amount={sum}
                />
              ))
            ) : (
              currentMonthExpenses.map(({ category, sum }) => (
                <Transaction
                  key={category.id}
                  category={category.name}
                  date={category.description || 'No description'}
                  amount={Math.abs(sum)}
                />
              ))
            )}
          </Card.Body>
        </Card>
      </Grid>

      <Grid item xs={12} md={12} lg={7} xl={6}>
        <Grid container item spacing={3}>
          {StatsCards.map((props) => (
            <Grid item xs={6} md={6} lg={6}>
              <Stats {...props} />
            </Grid>
          ))}

          {/* {TimeRangeStatsCard.map((props) => (
            <Grid item xs={6} md={6} lg={6}>
              <Stats {...props} />
            </Grid>
          ))} */}
        </Grid>

        <Card sx={{ mt: 2 }}>
          <Card.Header>
            <Box>
              <Card.Title>Category Budgets</Card.Title>
            </Box>
            <Card.HeaderActions>
              <Tooltip title="Set Budget">
                <IconButton onClick={budgetFormHandler.open}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {budget.map((item) => (
              <CategoryBudget
                key={item.id}
                title={item.category.name}
                subtitle={item.category.description || 'No description'}
                budget={item.budget || 0}
                amount={item.currentlySpent || 0}
              />
            ))}
          </Card.Body>
        </Card>
      </Grid>

      <FormDrawer
        open={showAddBudgetForm}
        heading="Set Budget"
        onClose={budgetFormHandler.close}
        onSubmit={budgetFormHandler.onSubmit}
        closeOnBackdropClick
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {categories.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Info</AlertTitle>
            To be able to create a transaction you have to create a category under{' '}
            <strong>Categories {'>'} Add Category</strong> before.{' '}
          </Alert>
        )}

        {!loading && categories.length > 0 && (
          <>
            <Autocomplete
              id="add-category"
              options={categories.map((item) => ({ label: item.name, value: item.id }))}
              sx={{ mb: 2 }}
              onChange={(event, value) =>
                budgetFormHandler.autocompleteChange(event, Number(value?.value))
              }
              renderInput={(props) => <TextField {...props} label="Category" />}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="add-budget">Monthly Budget</InputLabel>
              <OutlinedInput
                id="add-budget"
                label="Monthly Budget"
                name="budget"
                inputProps={{ inputMode: 'numeric' }}
                onChange={budgetFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>
          </>
        )}
      </FormDrawer>
    </Grid>
  );
};
