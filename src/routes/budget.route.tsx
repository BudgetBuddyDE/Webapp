import { Add as AddIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { format, isSameDay } from 'date-fns';
import React from 'react';
import {
  ActionPaper,
  BarChart,
  BarChartData,
  Card,
  CategoryBudget,
  CategoryBudgetProps,
  CircularProgress,
  CreateBudget,
  EditBudget,
  ICreateBudgetProps,
  IEditBudgetProps,
  NoResults,
  PageHeader,
  Transaction,
} from '../components';
import { AuthContext, SnackbarContext, StoreContext } from '../context';
import { useScreenSize } from '../hooks';
import { Budget as BudgetModel } from '../models';
import { BudgetService, ExpenseService, IncomeService } from '../services';
import { formatBalance, getFirstDayOfMonth } from '../utils';

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';

export type ChartContentType = 'INCOME' | 'SPENDINGS';

export const ChartContentTypes = [
  { type: 'INCOME' as ChartContentType, label: 'Income' },
  { type: 'SPENDINGS' as ChartContentType, label: 'Spendings' },
];

export const Budget = () => {
  const screenSize = useScreenSize();
  const [, startTransition] = React.useTransition();
  const { session } = React.useContext(AuthContext);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, setLoading, budget, setBudget, budgetTransactions, setBudgetTransactions } =
    React.useContext(StoreContext);
  const [chart, setChart] = React.useState<ChartContentType>('INCOME');
  const [dateRange, setDateRange] = React.useState({ from: getFirstDayOfMonth(), to: new Date() });
  const [showForm, setShowForm] = React.useState<{
    createBudget: boolean;
    editBudget: BudgetModel | null;
  }>({
    createBudget: false,
    editBudget: null,
  });

  const handler: {
    onDateFromChange: (value: Date | null, keyboardInputValue?: string | undefined) => void;
    onDateToChange: (value: Date | null, keyboardInputValue?: string | undefined) => void;
    onBudgetDelete: CategoryBudgetProps['onDelete'];
    createBudget: {
      onShowAddBudgetForm: () => void;
      onSetOpen: ICreateBudgetProps['setOpen'];
    };
    editBudget: {
      onSetOpen: IEditBudgetProps['setOpen'];
      onEdit: CategoryBudgetProps['onEdit'];
    };
    charts: {
      onEvent: (bar: BarChartData | null) => void;
      onChangeChart: (event: React.BaseSyntheticEvent) => void;
    };
  } = {
    onDateFromChange(value, keyboardInputValue) {
      setDateRange((prev) => ({ ...prev, from: value || new Date() }));
    },
    onDateToChange(value, keyboardInputValue) {
      setDateRange((prev) => ({ ...prev, from: value || new Date() }));
    },
    onBudgetDelete: async (deleteBudget) => {
      try {
        const deletedBudgets = await deleteBudget;
        if (!deletedBudgets || deletedBudgets.length < 1) throw new Error('No budget deleted');
        startTransition(() => {
          setBudget({ type: 'REMOVE_BY_ID', id: deletedBudgets[0].id });
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
    createBudget: {
      onShowAddBudgetForm() {
        setShowForm((prev) => ({ ...prev, createBudget: true }));
      },
      onSetOpen(show) {
        setShowForm((prev) => ({ ...prev, createBudget: show }));
      },
    },
    editBudget: {
      onSetOpen(show) {
        if (!show) setShowForm((prev) => ({ ...prev, editBudget: null }));
      },
      onEdit: (budget) => {
        setShowForm((prev) => ({ ...prev, editBudget: budget }));
      },
    },
    charts: {
      onEvent(bar) {
        if (!bar) return;
        setBudgetTransactions({
          type: 'UPDATE_SELECTED',
          selected: {
            date: new Date(bar.label),
            amount: bar.value,
          },
        });
      },
      onChangeChart(event) {
        const newChart = event.target.value as ChartContentType;
        if (newChart === chart) return;

        setChart(newChart);
        const transactions =
          newChart === 'INCOME' ? budgetTransactions.data.income.daily : budgetTransactions.data.spendings.daily;
        const today = transactions[transactions.length - 1];
        setBudgetTransactions({
          type: 'UPDATE_SELECTED',
          selected: {
            amount: today.amount,
            date: new Date(today.date),
          },
        });
      },
    },
  };

  React.useEffect(() => {
    if (!session || !session.user) return setBudgetTransactions({ type: 'CLEAR_DATA' });
    if (!budgetTransactions.fetched) return;
    setLoading(true);
    const from = dateRange.from;
    const to = dateRange.to;
    Promise.all([
      IncomeService.getIncome(session!.user!.id, from, to),
      IncomeService.getDailyIncome(from, to),
      ExpenseService.getExpenses(session!.user!.id, from, to),
      ExpenseService.getDailyExpenses(from, to),
    ])
      .then(([getIncome, getDailyIncome, getExpenses, getDailyExpenses]) => {
        const today = getDailyIncome ? getDailyIncome[getDailyIncome.length - 1] : null;
        setBudgetTransactions({
          type: 'FETCH_DATA',
          fetchedBy: session!.user!.id,
          data: {
            selected: today
              ? {
                  date: new Date(today.date),
                  amount: today.amount,
                }
              : null,
            income: {
              daily: getDailyIncome ?? [],
              grouped: getIncome ?? [],
            },
            spendings: {
              daily: getDailyExpenses ?? [],
              grouped: getExpenses ?? [],
            },
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  React.useEffect(() => {
    if (!session || !session.user) return setBudgetTransactions({ type: 'CLEAR_DATA' });
    if (
      budgetTransactions.fetched &&
      budgetTransactions.fetchedBy === session.user.id &&
      budgetTransactions.data !== null
    )
      return;
    setLoading(true);
    const from = dateRange.from;
    const to = dateRange.to;
    Promise.all([
      IncomeService.getIncome(session!.user!.id, from, to),
      IncomeService.getDailyIncome(from, to),
      ExpenseService.getExpenses(session!.user!.id, from, to),
      ExpenseService.getDailyExpenses(from, to),
    ])
      .then(([getIncome, getDailyIncome, getExpenses, getDailyExpenses]) => {
        const today = getDailyIncome ? getDailyIncome[getDailyIncome.length - 1] : null;
        setBudgetTransactions({
          type: 'FETCH_DATA',
          fetchedBy: session!.user!.id,
          data: {
            selected: today
              ? {
                  date: new Date(today.date),
                  amount: today.amount,
                }
              : null,
            income: {
              daily: getDailyIncome ?? [],
              grouped: getIncome ?? [],
            },
            spendings: {
              daily: getDailyExpenses ?? [],
              grouped: getExpenses ?? [],
            },
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, budgetTransactions]);

  React.useEffect(() => {
    if (!session || !session.user) return;
    if (budget.fetched && budget.fetchedBy === session.user.id && budget.data !== null) return;
    setLoading(true);
    BudgetService.getBudget(session.user.id)
      .then((rows) => setBudget({ type: 'FETCH_DATA', data: rows, fetchedBy: session!.user!.id }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, budget]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Budget" description="How much did u spent this month?" />

      <Grid item xs={12} md={12} lg={5} xl={5}>
        <Card>
          <Card.Header sx={{ mb: 2 }}>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Your category statistics</Card.Subtitle>
            </Box>

            <Card.HeaderActions>
              <ActionPaper>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  value={chart}
                  onChange={handler.charts.onChangeChart}
                  exclusive
                >
                  {ChartContentTypes.map((button) => (
                    <ToggleButton key={button.type} value={button.type}>
                      {button.label}
                    </ToggleButton>
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
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.from}
                    onChange={handler.onDateFromChange}
                    renderInput={(params) => <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />}
                  />
                ) : (
                  <DesktopDatePicker
                    label="From"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.from}
                    onChange={handler.onDateFromChange}
                    renderInput={(params) => <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />}
                  />
                )}

                {screenSize === 'small' ? (
                  <MobileDatePicker
                    label="To"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.to}
                    onChange={handler.onDateToChange}
                    renderInput={(params) => <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />}
                  />
                ) : (
                  <DesktopDatePicker
                    label="To"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.to}
                    onChange={handler.onDateToChange}
                    renderInput={(params) => <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />}
                  />
                )}
              </LocalizationProvider>
            </Box>
          </Card.Header>
          <Card.Body>
            {loading && !budgetTransactions.fetched ? (
              <CircularProgress />
            ) : budgetTransactions.data.income.daily && budgetTransactions.data.spendings.daily ? (
              <Paper elevation={0} sx={{ mt: '1rem' }}>
                {budgetTransactions.data.selected && (
                  <Box sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="caption">
                      {isSameDay(budgetTransactions.data.selected.date, new Date())
                        ? 'Today'
                        : format(budgetTransactions.data.selected.date, 'dd.MM.yy')}
                    </Typography>
                    <Typography variant="subtitle1">
                      {formatBalance(budgetTransactions.data.selected.amount)}
                    </Typography>
                  </Box>
                )}

                <ParentSize>
                  {({ width }) => (
                    <BarChart
                      width={width}
                      height={width * 0.6}
                      data={budgetTransactions.data[chart === 'INCOME' ? 'income' : 'spendings'].daily.map((day) => ({
                        label: day.date.toString(),
                        value: day.amount,
                      }))}
                      onEvent={handler.charts.onEvent}
                      events
                    />
                  )}
                </ParentSize>
              </Paper>
            ) : (
              <NoResults sx={{ mt: 2 }} text="Nothing was returned" />
            )}

            <Divider sx={{ mt: 2 }} />

            {loading && !budgetTransactions.fetched ? (
              <CircularProgress />
            ) : chart === 'INCOME' ? (
              budgetTransactions.data.income.grouped.length > 0 ? (
                budgetTransactions.data.income.grouped.map(({ category, sum }) => (
                  <Transaction
                    key={category.id}
                    title={category.name}
                    subtitle={category.description || 'No description'}
                    amount={sum}
                  />
                ))
              ) : (
                <NoResults sx={{ mt: 2 }} text="No results for the timespan" />
              )
            ) : budgetTransactions.data.spendings.grouped.length > 0 ? (
              budgetTransactions.data.spendings.grouped.map(({ category, sum }) => (
                <Transaction
                  key={category.id}
                  title={category.name}
                  subtitle={category.description || 'No description'}
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
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Category Budgets</Card.Title>
              <Card.Subtitle>Set a limit for your spending</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <ActionPaper>
                <Tooltip title="Set Budget">
                  <IconButton color="primary" onClick={handler.createBudget.onShowAddBudgetForm}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading && !budget.fetched ? (
              <CircularProgress />
            ) : budget.data && budget.data.length > 0 ? (
              budget.data.map((item) => (
                <CategoryBudget
                  key={item.id}
                  budget={item}
                  onEdit={handler.editBudget.onEdit}
                  onDelete={handler.onBudgetDelete}
                />
              ))
            ) : (
              <NoResults sx={{ mt: 2 }} text="No budget found" />
            )}
          </Card.Body>
        </Card>
      </Grid>

      <CreateBudget open={showForm.createBudget} setOpen={handler.createBudget.onSetOpen} />

      <EditBudget
        open={showForm.editBudget !== null}
        setOpen={handler.editBudget.onSetOpen}
        budget={showForm.editBudget}
      />
    </Grid>
  );
};
