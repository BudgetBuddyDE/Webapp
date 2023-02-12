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
import { ExpenseService, IncomeService } from '../services';
import type { DailyIncome, DailySpending, IExpense, IIncome } from '../types';
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
  const { loading, budget, setBudget } = React.useContext(StoreContext);
  const [chart, setChart] = React.useState<ChartContentType>('INCOME');
  const [dateRange, setDateRange] = React.useState({ from: getFirstDayOfMonth(), to: new Date() });
  const [dailyTransactions, setDailyTransactions] = React.useState<{
    selected: DailyIncome | DailySpending | null;
    income: DailyIncome[];
    spendings: DailySpending[];
  }>({ income: [], spendings: [], selected: null });
  const [income, setIncome] = React.useState<IIncome[]>([]);
  const [expenses, setExpenses] = React.useState<IExpense[]>([]);
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
        setDailyTransactions((prevState) => ({
          ...prevState,
          selected: {
            date: new Date(bar.label),
            amount: bar.value,
          },
        }));
      },
      onChangeChart(event) {
        const newChart = event.target.value as ChartContentType;
        if (newChart === chart) return;

        setChart(newChart);
        setDailyTransactions((prev) => {
          const list = newChart === 'INCOME' ? prev.income : prev.spendings;
          const today = list[list.length - 1];
          return {
            ...prev,
            selected: {
              amount: today.amount,
              date: new Date(today.date),
            },
          };
        });
      },
    },
  };

  React.useEffect(() => {
    const from = dateRange.from;
    const to = dateRange.to;
    Promise.all([
      IncomeService.getIncome(session!.user!.id, from, to),
      IncomeService.getDailyIncome(from, to),
      ExpenseService.getExpenses(session!.user!.id, from, to),
      ExpenseService.getDailyExpenses(from, to),
    ])
      .then(async ([getIncome, getDailyIncome, getExpenses, getDailyExpenses]) => {
        if (getIncome) {
          setIncome(getIncome);
        } else setIncome([]);

        if (getDailyIncome) {
          const today = getDailyIncome[getDailyIncome.length - 1];
          setDailyTransactions((prev) => ({
            ...prev,
            income: getDailyIncome,
            selected: today
              ? {
                  amount: today.amount,
                  date: new Date(today.date),
                }
              : null,
          }));
        }

        if (getExpenses) {
          setExpenses(getExpenses);
        } else setExpenses([]);

        if (getDailyExpenses) {
          setDailyTransactions((prev) => ({ ...prev, spendings: getDailyExpenses }));
        }
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
                  onChange={handler.charts.onChangeChart}
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
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.from}
                    onChange={handler.onDateFromChange}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                ) : (
                  <DesktopDatePicker
                    label="From"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.from}
                    onChange={handler.onDateFromChange}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                )}

                {screenSize === 'small' ? (
                  <MobileDatePicker
                    label="To"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.to}
                    onChange={handler.onDateToChange}
                    renderInput={(params) => (
                      <TextField size="small" sx={{ width: 110, mr: 2 }} {...params} />
                    )}
                  />
                ) : (
                  <DesktopDatePicker
                    label="To"
                    inputFormat={DATE_RANGE_INPUT_FORMAT}
                    value={dateRange.to}
                    onChange={handler.onDateToChange}
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
            ) : dailyTransactions.income && dailyTransactions.spendings ? (
              <Paper elevation={0} sx={{ mt: '1rem' }}>
                {dailyTransactions.selected && (
                  <Box sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="caption">
                      {isSameDay(dailyTransactions.selected.date, new Date())
                        ? 'Today'
                        : format(dailyTransactions.selected.date, 'dd.MM.yy')}
                    </Typography>
                    <Typography variant="subtitle1">
                      {formatBalance(dailyTransactions.selected.amount)}
                    </Typography>
                  </Box>
                )}

                {chart === 'INCOME' ? (
                  <ParentSize>
                    {({ width }) => (
                      <BarChart
                        width={width}
                        height={width * 0.6}
                        data={dailyTransactions.income.map((day) => ({
                          label: day.date.toString(),
                          value: day.amount,
                        }))}
                        onEvent={handler.charts.onEvent}
                        events
                      />
                    )}
                  </ParentSize>
                ) : (
                  <ParentSize>
                    {({ width }) => (
                      <BarChart
                        width={width}
                        height={width * 0.6}
                        data={dailyTransactions.spendings.map((day) => ({
                          label: day.date.toString(),
                          value: day.amount,
                        }))}
                        onEvent={handler.charts.onEvent}
                        events
                      />
                    )}
                  </ParentSize>
                )}
              </Paper>
            ) : (
              <NoResults sx={{ mt: 2 }} text="Nothing was returned" />
            )}

            <Divider sx={{ mt: 2 }} />

            {loading ? (
              <CircularProgress />
            ) : chart === 'INCOME' ? (
              income.length > 0 ? (
                income.map(({ category, sum }) => (
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
            ) : expenses.length > 0 ? (
              expenses.map(({ category, sum }) => (
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
            {loading ? (
              <CircularProgress />
            ) : budget.length > 0 ? (
              budget.map((item) => (
                <CategoryBudget
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
