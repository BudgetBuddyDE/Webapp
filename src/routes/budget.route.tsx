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
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { isSameMonth } from 'date-fns';
import Card from '../components/card.component';
import { PageHeader } from '../components/page-header.component';
import { AuthContext } from '../context/auth.context';
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
import { IBaseBudget, IBudget } from '../types/budget.interface';
import { Stats, StatsProps } from '../components/stats-card.component';
import { ExpenseService } from '../services/expense.service';
import { IncomeService } from '../services/income.service';

type ChartContent = 'INCOME' | 'SPENDINGS';

export const Budget = () => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, transactions, subscriptions, categories } = useContext(StoreContext);
  const [chart, setChart] = useState<ChartContent>('INCOME');
  const [dateRange, setDateRange] = useState({ from: getFirstDayOfMonth(), to: new Date() });
  const [dailyIncome, setDailyIncome] = useState<IDailyTransaction[]>([]);
  const [income, setIncome] = useState<IIncome[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<IDailyTransaction[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [budget, setBudget] = useState<IBudget[]>([]);
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [addBudgetForm, setAddBudgetForm] = useState<Record<string, string | number>>({});
  const [editBudgetForm, setEditBudgetForm] = useState<Record<string, string | number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const addBudgetHandler = {
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
        if (!values.includes('budget')) throw new Error('Provide an budget');

        // Check if the user has already set an budget for this category
        if (budget.find((budget) => budget.category.id === addBudgetForm.category))
          throw new Error("You've already set an Budget for this category");

        const data = await BudgetService.create([
          {
            category: Number(addBudgetForm.category),
            budget: transformBalance(addBudgetForm.budget.toString()),
            created_by: session!.user!.id,
          },
        ]);
        if (data === null) throw new Error('No budget saved');
        setBudget((prev) => [
          ...prev,
          {
            id: data[0].id,
            category: categories.find((category) => category.id === data[0].category) as {
              id: number;
              name: string;
              description: string | null;
            },
            budget: data[0].budget,
            currentlySpent: Math.abs(
              transactions
                .filter(
                  (transaction) =>
                    transaction.amount < 0 &&
                    isSameMonth(new Date(transaction.date), new Date()) &&
                    new Date(transaction.date) <= new Date() &&
                    transaction.categories.id === data[0].category
                )
                .reduce((prev, cur) => prev + cur.amount, 0)
            ),
          } as IBudget,
        ]);
        addBudgetHandler.close();
        showSnackbar({
          message: `Budget for category '${
            categories.find((category) => category.id === data[0].category)!.name
          }' saved`,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const editBudgetHandler = {
    open: ({ id, category, budget }: IBudget) => {
      setEditBudgetForm({ id, category: category.id, budget });
    },
    close: () => {
      setEditBudgetForm({});
      setErrorMessage('');
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditBudgetForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(editBudgetForm);
        if (!values.includes('id')) throw new Error('Provide an id');
        if (!values.includes('budget')) throw new Error('Provide an budget');

        const data = await BudgetService.update(Number(editBudgetForm.id), {
          budget: transformBalance(editBudgetForm.budget.toString()),
        } as Partial<IBaseBudget>);
        if (data === null) throw new Error('No budget updated');

        setBudget((prev) =>
          prev.map((budget) => {
            if (budget.id === data[0].id) {
              return {
                ...budget,
                id: data[0].id,
                category: categories.find((category) => category.id === data[0].category) as {
                  id: number;
                  name: string;
                  description: string | null;
                },
                budget: data[0].budget,
              };
            }
            return budget;
          })
        );
        editBudgetHandler.close();
        showSnackbar({
          message: `Budget for category '${
            categories.find((category) => category.id === data[0].category)!.name
          }' saved`,
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const handleBudgetDelete = async (budgetId: number) => {
    try {
      const data = BudgetService.deleteById(budgetId);
      if (!data) throw new Error('No budget deleted');
      setBudget((prev) => prev.filter((budget) => budget.id !== budgetId));
      showSnackbar({
        message: `Budget deleted`,
      });
    } catch (error) {
      console.error(error);
      showSnackbar({
        // @ts-ignore
        message: error.message || "Could'nt delete the budget",
        action: <Button onClick={() => handleBudgetDelete(budgetId)}>Retry</Button>,
      });
    }
  };

  const StatsCalculations: { income: number; spendings: number } = {
    income: useMemo(
      () =>
        Math.abs(
          subscriptions
            .filter((subscription) => subscription.amount > 0)
            .reduce((prev, cur) => prev + cur.amount, 0)
        ),
      [subscriptions]
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
      info: 'Your monthly income based on your subscriptions.',
    },
    {
      title: StatsCalculations.spendings.toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Subscriptions',
      info: 'Your monthly subscriptions.',
    },
    {
      title: (StatsCalculations.income - StatsCalculations.spendings).toLocaleString('de', {
        style: 'currency',
        currency: 'EUR',
      }),
      subtitle: 'Balance',
      info: 'Balance after subtracting your subscriptions from your income.',
    },
  ];

  useEffect(() => {
    BudgetService.getBudget(session!.user!.id)
      .then((data) => {
        if (data) {
          setBudget(data);
        } else setBudget([]);
      })
      .catch((error) => console.error(error));
  }, [session!.user!.id]);

  useEffect(() => {
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
  }, [session!.user!.id, dateRange]);

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
              {[
                { type: 'INCOME', label: 'Income' },
                { type: 'SPENDIGNS', label: 'Spendings' },
              ].map((btn) => (
                <Button
                  sx={{
                    color: (theme) => theme.palette.text.primary,
                    px: 1,
                    minWidth: 'unset',
                    backgroundColor: (theme) =>
                      chart === btn.type ? theme.palette.action.focus : 'unset',
                  }}
                  onClick={() => setChart(btn.type as ChartContent)}
                >
                  {btn.label}
                </Button>
              ))}
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
              income.map(({ category, sum }) => (
                <Transaction
                  key={category.id}
                  category={category.name}
                  date={category.description || 'No description'}
                  amount={sum}
                />
              ))
            ) : (
              expenses.map(({ category, sum }) => (
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

      <Grid item xs={12} md={12} lg={7} xl={7}>
        <Grid item container spacing={3}>
          {StatsCards.map((props) => (
            <Grid item xs={6} md={4} lg={4}>
              <Stats {...props} />
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 2 }}>
          <Card.Header>
            <Box>
              <Card.Title>Category Budgets</Card.Title>
            </Box>
            <Card.HeaderActions>
              <Tooltip title="Set Budget">
                <IconButton onClick={addBudgetHandler.open}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                {budget.map((item) => (
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <CategoryBudget
                        key={item.id}
                        title={item.category.name}
                        subtitle={item.category.description || 'No description'}
                        budget={item.budget || 0}
                        amount={item.currentlySpent || 0}
                      />
                    </Box>
                    {/* mt: 2 is required, to have all items vertically centered bcause <CategoryBudget />-components have an margin-top of 2 by default */}
                    <Tooltip title="Edit">
                      <IconButton sx={{ mt: 2 }} onClick={() => editBudgetHandler.open(item)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton sx={{ mt: 2 }} onClick={() => handleBudgetDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </>
            )}
          </Card.Body>
        </Card>
      </Grid>

      <FormDrawer
        open={showAddBudgetForm}
        heading="Set Budget"
        onClose={addBudgetHandler.close}
        onSubmit={addBudgetHandler.onSubmit}
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
                addBudgetHandler.autocompleteChange(event, Number(value?.value))
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
                onChange={addBudgetHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>
          </>
        )}
      </FormDrawer>

      <FormDrawer
        open={Object.keys(editBudgetForm).length > 0}
        heading="Update Budget"
        onClose={editBudgetHandler.close}
        onSubmit={editBudgetHandler.onSubmit}
        closeOnBackdropClick
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!loading && (
          <>
            <FormControl fullWidth>
              <InputLabel htmlFor="add-budget">Monthly Budget</InputLabel>
              <OutlinedInput
                id="add-budget"
                label="Monthly Budget"
                name="budget"
                inputProps={{ inputMode: 'numeric' }}
                defaultValue={editBudgetForm.budget}
                onChange={editBudgetHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>
          </>
        )}
      </FormDrawer>
    </Grid>
  );
};
