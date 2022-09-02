import { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Tooltip,
  IconButton,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TextField,
  Chip,
  Alert,
  Button,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  OutlinedInput,
  AlertTitle,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SxProps, Theme } from '@mui/material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/search-input.component';
import { AuthContext } from '../context/auth.context';
import type { IBaseSubscriptionDTO, ISubscription } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { StoreContext } from '../context/store.context';
import { getCategoryFromList } from '../utils/getCategoryFromList';
import { getPaymentMethodFromList } from '../utils/getPaymentMethodFromList';
import { SubscriptionService } from '../services/subscription.service';
import { transformBalance } from '../utils/transformBalance';
import { determineNextExecution } from '../utils/determineNextExecution';
import { ReceiverAutocomplete } from '../components/receiver-autocomplete.component';
import { NoResults } from '../components/no-results.component';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export const Subscriptions = () => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const {
    loading,
    transactions,
    transactionReceiver,
    subscriptions,
    setSubscriptions,
    categories,
    paymentMethods,
  } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = useState('');
  const [shownSubscriptions, setShownSubscriptions] =
    useState<readonly ISubscription[]>(subscriptions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string | number | Date>>({});
  const [editForm, setEditForm] = useState<Record<string, string | number | Date>>({});

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const addFormHandler = {
    open: () => setShowAddForm(true),
    close: () => {
      setShowAddForm(false);
      setAddForm({});
      setErrorMessage('');
    },
    dateChange: (date: Date | null) => {
      setAddForm((prev) => ({ ...prev, execute_at: date || new Date() }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setAddForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setAddForm((prev) => ({ ...prev, receiver: value }));
    },
    save: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(addForm);
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an payment method');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an receiver');

        const data = await SubscriptionService.createSubscriptions([
          {
            // @ts-ignore
            execute_at: addForm.execute_at ? addForm.execute_at.getDate() : new Date().getDate(),
            category: addForm.category,
            paymentMethod: addForm.paymentMethod,
            receiver: addForm.receiver,
            amount: transformBalance(addForm.amount.toString()),
            description: addForm.description || null,
            // @ts-ignore
            created_by: session?.user?.id,
          } as IBaseSubscriptionDTO,
        ]);
        if (data === null) throw new Error('No subscriptions created');

        setSubscriptions((prev) => [
          ...prev,
          // @ts-ignore
          {
            ...data[0],
            categories: categories.find((value) => value.id === data[0].category),
            paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
          } as ISubscription,
        ]);
        addFormHandler.close();
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

  const editFormHandler = {
    open: ({
      id,
      execute_at,
      categories,
      paymentMethods,
      receiver,
      amount,
      description,
    }: ISubscription) => {
      const execute = new Date();
      execute.setDate(execute_at);
      setEditForm({
        id,
        execute_at: execute,
        category: categories.id,
        paymentMethod: paymentMethods.id,
        receiver,
        amount,
        description: description || '',
      });
    },
    close: () => {
      setEditForm({});
      setErrorMessage('');
    },
    dateChange: (date: Date | null) => {
      setEditForm((prev) => ({ ...prev, execute_at: date || new Date() }));
    },
    autocompleteChange: (
      event: React.SyntheticEvent<Element, Event>,
      key: 'category' | 'paymentMethod',
      value: string | number
    ) => {
      setEditForm((prev) => ({ ...prev, [key]: value }));
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    receiverChange: (value: string | number) => {
      setEditForm((prev) => ({ ...prev, receiver: value }));
    },
    save: async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        const values = Object.keys(editForm);
        if (!values.includes('id')) throw new Error('Provide an id');
        if (!values.includes('execute_at')) throw new Error('Provide an category');
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an payment method');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an receiver');

        const update = {
          id: editForm.id,
          // @ts-ignore
          execute_at: editForm.execute_at.getDate() || new Date().getDate(),
          category: editForm.category,
          paymentMethod: editForm.paymentMethod,
          receiver: editForm.receiver,
          amount: transformBalance(editForm.amount.toString()),
          description: editForm.description || null,
          // @ts-ignore
          created_by: session?.user?.id,
        };

        const data = await SubscriptionService.updateSubscription(
          Number(editForm.id),
          update as IBaseSubscriptionDTO
        );
        if (data === null) throw new Error('No subscription updated');

        editFormHandler.close();
        // @ts-ignore
        setSubscriptions((prev) =>
          prev.map((subscription) => {
            if (subscription.id === data[0].id) {
              return {
                ...subscription,
                ...data[0],
                categories: categories.find((category) => category.id === data[0].category),
                paymentMethods: paymentMethods.find(
                  (paymentMethod) => paymentMethod.id === data[0].paymentMethod
                ),
              };
            }
            return subscription;
          })
        );
        showSnackbar({
          message: 'Subscription updated',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const handleDelete = async (id: number) => {
    try {
      const data = await SubscriptionService.deleteSubscriptionById(id);
      if (data === null) throw new Error('No subscription deleted');
      setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
      showSnackbar({ message: `Subscription ${data[0].receiver} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete transaction`,
        action: <Button onClick={() => handleDelete(id)}>Retry</Button>,
      });
    }
  };

  useEffect(() => setShownSubscriptions(subscriptions), [subscriptions]);

  useEffect(() => {
    if (subscriptions.length === 0) return;
    if (keyword === '') setShownSubscriptions(subscriptions);
    setShownSubscriptions(
      subscriptions.filter(
        (item) =>
          item.categories.name.toLowerCase().includes(keyword) ||
          item.paymentMethods.name.toLowerCase().includes(keyword) ||
          item.description?.toString().toLowerCase().includes(keyword)
      )
    );
  }, [keyword, subscriptions]);

  useEffect(() => console.log(editForm), [editForm]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Subscriptions" description="You got Disney+?" />

      <Grid item xs={12} md={12}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your monthly subscriptions</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <SearchInput sx={{ mr: '.5rem' }} onSearch={handleOnSearch} />
              <Tooltip title="Add Subscription">
                <IconButton aria-label="add-subscription" onClick={addFormHandler.open}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : subscriptions.length > 0 ? (
            <>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Subscriptions Table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Next execution</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Information</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {shownSubscriptions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="bold">
                                {determineNextExecution(row.execute_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={row.categories.name} variant="outlined" />
                            </TableCell>
                            <TableCell>{row.receiver}</TableCell>
                            <TableCell>
                              {row.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </TableCell>
                            <TableCell>
                              <Chip label={row.paymentMethods.name} variant="outlined" />
                            </TableCell>
                            <TableCell>{row.description || 'No Information'}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit" placement="top">
                                <IconButton onClick={() => editFormHandler.open(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton onClick={() => handleDelete(row.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer>
                <TablePagination
                  component="div"
                  count={shownSubscriptions.length}
                  page={page}
                  onPageChange={handlePageChange}
                  labelRowsPerPage="Rows:"
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No subscriptions found" />
          )}
        </Card>
      </Grid>

      {/* Add Subscription */}
      <FormDrawer
        open={showAddForm}
        heading="Add Subscription"
        onClose={addFormHandler.close}
        onSubmit={addFormHandler.save}
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
                  value={addForm.execute_at || new Date()}
                  onChange={addFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Execute at"
                  inputFormat="dd"
                  value={addForm.execute_at || new Date()}
                  onChange={addFormHandler.dateChange}
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
                  addFormHandler.autocompleteChange(event, 'category', Number(value?.value))
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
                  addFormHandler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
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
              onValueChange={addFormHandler.receiverChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="add-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                label="Amount"
                name="amount"
                inputProps={{ inputMode: 'numeric' }}
                onChange={addFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="add-information"
              variant="outlined"
              label="Information"
              name="description"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              onChange={addFormHandler.inputChange}
            />
          </>
        )}
      </FormDrawer>

      {/* Edit Subscription */}
      <FormDrawer
        open={Object.keys(editForm).length > 0}
        heading="Edit Subscription"
        onClose={editFormHandler.close}
        onSubmit={editFormHandler.save}
        saveLabel="Save"
        closeLabel="Dismiss"
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
          <form>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {screenSize === 'small' ? (
                <MobileDatePicker
                  label="Execute at"
                  inputFormat="dd"
                  value={editForm.execute_at}
                  onChange={editFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Execute at"
                  inputFormat="dd"
                  value={editForm.execute_at}
                  onChange={editFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              )}
            </LocalizationProvider>

            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Autocomplete
                id="edit-category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                defaultValue={getCategoryFromList(Number(editForm.category), categories)}
                onChange={(event, value) =>
                  editFormHandler.autocompleteChange(event, 'category', Number(value?.value))
                }
                renderInput={(props) => <TextField {...props} label="Category" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
              <Autocomplete
                id="edit-payment-method"
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                options={paymentMethods.map(({ id, name, provider }) => ({
                  label: `${name} • ${provider}`,
                  value: id,
                }))}
                defaultValue={getPaymentMethodFromList(
                  Number(editForm.paymentMethod),
                  paymentMethods
                )}
                onChange={(event, value) =>
                  editFormHandler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                }
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>

            <ReceiverAutocomplete
              sx={FormStyle}
              id="edit-receiver"
              label="Receiver"
              options={transactionReceiver}
              onValueChange={editFormHandler.receiverChange}
              defaultValue={String(editForm.receiver)}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="edit-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                name="amount"
                label="Amount"
                defaultValue={editForm.amount}
                inputProps={{ inputMode: 'numeric' }}
                onChange={editFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="edit-information"
              variant="outlined"
              label="Information"
              name="description"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              defaultValue={editForm.description}
              onChange={editFormHandler.inputChange}
            />
          </form>
        )}
      </FormDrawer>
    </Grid>
  );
};
