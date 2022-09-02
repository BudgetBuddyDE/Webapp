import { ChangeEvent, FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Box,
  Tooltip,
  IconButton,
  TextField,
  Alert,
  Button,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  OutlinedInput,
  AlertTitle,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  IBaseTransactionDTO,
  IBaseSubscriptionDTO,
  IExpense,
  ISubscription,
  ITransaction,
} from '../types/transaction.interface';
import { FormDrawer } from '../components/form-drawer.component';
import { DateService } from '../services/date.service';
import { determineNextExecution } from '../utils/determineNextExecution';
import { CircularProgress } from '../components/progress.component';
import { isSameMonth } from 'date-fns/esm';
import { SnackbarContext } from '../context/snackbar.context';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { StoreContext } from '../context/store.context';
import { SubscriptionService } from '../services/subscription.service';
import { TransactionService } from '../services/transaction.service';
import { transformBalance } from '../utils/transformBalance';
import { ExpenseService } from '../services/expense.service';
import { ReceiverAutocomplete } from '../components/receiver-autocomplete.component';
import { addTransactionToExpenses } from '../utils/addTransactionToExpenses';
import { NoResults } from '../components/no-results.component';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export const Dashboard = () => {
  const { session } = useContext(AuthContext);
  const {
    loading,
    setLoading,
    subscriptions,
    setSubscriptions,
    transactions,
    transactionReceiver,
    setTransactions,
    categories,
    paymentMethods,
  } = useContext(StoreContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const screenSize = useScreenSize();
  const [chart, setChart] = useState<'MONTH' | 'ALL'>('MONTH');
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<IExpense[]>([]);
  const [allTimeExpenses, setAllTimeExpenses] = useState<IExpense[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [addTransactionForm, setAddTransactionForm] = useState<
    Record<string, string | number | Date>
  >({});
  const [addSubscriptionForm, setAddSubscriptionForm] = useState<
    Record<string, string | number | Date>
  >({});
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  const latestTransactions = useMemo(
    () => transactions.filter(({ date }) => new Date(new Date(date).toDateString()) <= new Date()),
    [transactions]
  );

  const transactionFormHandler = {
    open: () => {
      setShowAddTransactionForm(true);
    },
    close: () => {
      setShowAddTransactionForm(false);
      setAddTransactionForm({});
      setErrorMessage('');
    },
    dateChange: (date: Date | null) => {
      setAddTransactionForm((prev) => ({ ...prev, date: date || new Date() }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setAddTransactionForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddTransactionForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setAddTransactionForm((prev) => ({ ...prev, receiver: value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(addTransactionForm);
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an paymentMethod');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an amount');

        const data = await TransactionService.createTransactions([
          {
            date: addTransactionForm.date || new Date(),
            category: addTransactionForm.category,
            paymentMethod: addTransactionForm.paymentMethod,
            receiver: addTransactionForm.receiver,
            amount: transformBalance(addTransactionForm.amount.toString()),
            description: addTransactionForm.information || null,
            created_by: session!.user!.id,
          } as IBaseTransactionDTO,
        ]);
        if (data === null) throw new Error('No transaction created');

        const newTransaction = {
          ...data[0],
          categories: categories.find((value) => value.id === data[0].category),
          paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
        } as ITransaction;

        setTransactions((prev) => [newTransaction, ...prev]);
        // Refresh displayed spendings chart
        if (
          isSameMonth(new Date(newTransaction.date), new Date()) &&
          new Date(newTransaction.date) <= new Date()
        ) {
          addTransactionToExpenses(newTransaction, currentMonthExpenses, (updatedExpenses) =>
            setCurrentMonthExpenses(updatedExpenses)
          );
        }
        addTransactionToExpenses(newTransaction, allTimeExpenses, (updatedExpenses) =>
          setAllTimeExpenses(updatedExpenses)
        );
        transactionFormHandler.close();
        showSnackbar({
          message: 'Transaction added',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const subscriptionFormHandler = {
    open: () => setShowSubscriptionForm(true),
    close: () => {
      setShowSubscriptionForm(false);
      setAddSubscriptionForm({});
      setErrorMessage('');
    },
    dateChange: (date: Date | null) => {
      setAddSubscriptionForm((prev) => ({ ...prev, execute_at: date || new Date() }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setAddSubscriptionForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddSubscriptionForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setAddSubscriptionForm((prev) => ({ ...prev, receiver: value }));
    },
    onSubmit: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(addSubscriptionForm);
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an payment method');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an receiver');

        const data = await SubscriptionService.createSubscriptions([
          {
            // @ts-ignore
            execute_at: addForm.execute_at ? addForm.execute_at.getDate() : new Date().getDate(),
            category: addSubscriptionForm.category,
            paymentMethod: addSubscriptionForm.paymentMethod,
            receiver: addSubscriptionForm.receiver,
            amount: transformBalance(addSubscriptionForm.amount.toString()),
            description: addSubscriptionForm.information || null,
            created_by: session!.user!.id,
          } as IBaseSubscriptionDTO,
        ]);
        if (data === null) throw new Error('No subscription created');

        setSubscriptions((prev) => [
          ...prev,
          // @ts-ignore
          {
            ...data[0],
            categories: categories.find((value) => value.id === data[0].category),
            paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
          } as ISubscription,
        ]);
        subscriptionFormHandler.close();
        showSnackbar({
          message: 'Subscription added',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

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
          ) +
          Math.abs(
            transactions
              .filter(
                (transaction) =>
                  transaction.amount < 0 &&
                  new Date(transaction.date) > new Date() &&
                  isSameMonth(new Date(transaction.date), new Date())
              )
              .reduce((prev, cur) => prev + cur.amount, 0)
          ),
        [subscriptions, transactions]
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
                <IconButton aria-label="add-subscription" onClick={subscriptionFormHandler.open}>
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
                <IconButton aria-label="add-transaction" onClick={transactionFormHandler.open}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : latestTransactions.length > 0 ? (
              latestTransactions
                .slice(0, 6)
                .map(({ id, categories, receiver, amount, date }) => (
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

      {/* Add Transaction */}
      <FormDrawer
        open={showAddTransactionForm}
        heading="Add Transaction"
        onClose={transactionFormHandler.close}
        onSubmit={transactionFormHandler.onSubmit}
        saveLabel="Create"
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

        {paymentMethods.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Info</AlertTitle>
            To be able to create a transaction you have to create a payment method under{' '}
            <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
          </Alert>
        )}

        {!loading && categories.length > 0 && paymentMethods.length > 0 && (
          <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {screenSize === 'small' ? (
                <MobileDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={addTransactionForm.date || new Date()}
                  onChange={transactionFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={addTransactionForm.date || new Date()}
                  onChange={transactionFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              )}
            </LocalizationProvider>

            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Autocomplete
                id="add-category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  transactionFormHandler.autocompleteChange(event, 'category', Number(value?.value))
                }
                renderInput={(props) => <TextField {...props} label="Category" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
              <Autocomplete
                id="add-payment-method"
                options={paymentMethods.map((item) => ({
                  label: `${item.name} • ${item.provider}`,
                  value: item.id,
                }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  transactionFormHandler.autocompleteChange(
                    event,
                    'paymentMethod',
                    Number(value?.value)
                  )
                }
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>

            <ReceiverAutocomplete
              sx={FormStyle}
              id="add-receiver"
              label="Receiver"
              options={transactionReceiver}
              onValueChange={transactionFormHandler.receiverChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="add-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                label="Amount"
                name="amount"
                inputProps={{ inputMode: 'numeric' }}
                onChange={transactionFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="add-information"
              variant="outlined"
              label="Information"
              name="information"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              onChange={transactionFormHandler.inputChange}
            />
          </>
        )}
      </FormDrawer>

      {/* Add Subscription */}
      <FormDrawer
        open={showSubscriptionForm}
        heading="Add Subscription"
        onClose={subscriptionFormHandler.close}
        onSubmit={subscriptionFormHandler.onSubmit}
        saveLabel="Create"
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

        {paymentMethods.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Info</AlertTitle>
            To be able to create a transaction you have to create a payment method under{' '}
            <strong>Payment Methods {'>'} Add Payment Method</strong> before.{' '}
          </Alert>
        )}

        {!loading && categories.length > 0 && paymentMethods.length > 0 && (
          <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {screenSize === 'small' ? (
                <MobileDatePicker
                  label="Execute at"
                  inputFormat="dd"
                  value={addSubscriptionForm.execute_at || new Date()}
                  onChange={subscriptionFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Execute at"
                  inputFormat="dd"
                  value={addSubscriptionForm.execute_at || new Date()}
                  onChange={subscriptionFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              )}
            </LocalizationProvider>

            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Autocomplete
                id="add-category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  subscriptionFormHandler.autocompleteChange(
                    event,
                    'category',
                    Number(value?.value)
                  )
                }
                renderInput={(props) => <TextField {...props} label="Category" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
              <Autocomplete
                id="add-payment-method"
                options={paymentMethods.map((item) => ({
                  label: `${item.name} • ${item.provider}`,
                  value: item.id,
                }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(event, value) =>
                  subscriptionFormHandler.autocompleteChange(
                    event,
                    'paymentMethod',
                    Number(value?.value)
                  )
                }
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>

            <ReceiverAutocomplete
              sx={FormStyle}
              id="add-receiver"
              label="Receiver"
              options={transactionReceiver}
              onValueChange={subscriptionFormHandler.receiverChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="add-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                label="Amount"
                name="amount"
                inputProps={{ inputMode: 'numeric' }}
                onChange={subscriptionFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="add-information"
              variant="outlined"
              label="Information"
              name="information"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              onChange={subscriptionFormHandler.inputChange}
            />
          </>
        )}
      </FormDrawer>
    </Grid>
  );
};
