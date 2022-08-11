import { ChangeEvent, useContext, useEffect, useState } from 'react';
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
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import type { ICategory, IPaymentMethod, ISubscription } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { getCategories } from './categories.route';
import { getPaymentMethods } from './payment-method.route';
import { DateService } from '../services/date.service';
import { addMonths } from 'date-fns';
import { getCategory, getPaymentMethod } from './transactions.route';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export async function getSubscriptions(): Promise<ISubscription[] | null> {
  return new Promise(async (res, rej) => {
    const { data, error } = await supabase.from<ISubscription>('subscriptions').select(
      `
          id,
          amount,
          receiver,
          description, 
          execute_at,
          updated_at,
          inserted_at,
          paymentMethods (
            id, name, address, provider, description
          ),
          categories (
            id, name, description
          )`
    );
    if (error) rej(error);
    res(data);
  });
}

function determineNextExecution(executeAt: Number) {
  const now = new Date();
  const today = now.getDate();
  if (executeAt >= today) {
    return `${executeAt} ${DateService.shortMonthName(now)}.`;
  } else return `${executeAt} ${DateService.shortMonthName(addMonths(now, 1))}.`;
}

export const Subscriptions = () => {
  const screenSize = useScreenSize();
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [shownSubscriptions, setShownSubscriptions] =
    useState<readonly ISubscription[]>(subscriptions);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
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
    save: async () => {
      try {
        const values = Object.keys(addForm);
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an payment method');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an receiver');

        const { data, error } = await supabase.from('subscriptions').insert([
          {
            // @ts-ignore
            execute_at: addForm.execute_at.getDate() || new Date().getDate(),
            category: addForm.category,
            paymentMethod: addForm.paymentMethod,
            receiver: addForm.receiver,
            amount: Number(addForm.amount),
            description: addForm.information || null,
            // @ts-ignore
            created_by: session?.user?.id,
          },
        ]);
        if (error) throw error;

        setSubscriptions((prev) => [
          ...prev,
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
    save: async () => {
      try {
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
          amount: Number(editForm.amount),
          description: editForm.information || null,
          // @ts-ignore
          created_by: session?.user?.id,
        };

        const { data, error } = await supabase
          .from('subscriptions')
          .update(update)
          .match({ id: editForm.id });
        if (error) throw error;

        editFormHandler.close();
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
      const { data, error } = await supabase.from('subscriptions').delete().match({ id: id });
      if (error) throw error;
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

  useEffect(() => {
    Promise.all([getSubscriptions(), getCategories(), getPaymentMethods()])
      .then(([getSubscriptions, getCategories, getPaymentMethods]) => {
        if (getSubscriptions) {
          setSubscriptions(getSubscriptions);
        } else setSubscriptions([]);

        if (getCategories) {
          setCategories(getCategories);
        } else setCategories([]);

        if (getPaymentMethods) {
          setPaymentMethods(getPaymentMethods);
        } else setPaymentMethods([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session]);

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
          <Card.Body>
            {loading ? (
              <CircularProgress />
            ) : (
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
            )}
          </Card.Body>
          <Card.Footer>
            {!loading && (
              <TablePagination
                component="div"
                count={shownSubscriptions.length}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage="Rows:"
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Card.Footer>
        </Card>
      </Grid>

      {/* Add Subscription */}
      <FormDrawer
        open={showAddForm}
        heading="Add Subscription"
        onClose={addFormHandler.close}
        onSave={addFormHandler.save}
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
                  inputFormat="dd.MM.yy"
                  value={addForm.execute_at || new Date()}
                  onChange={addFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Execute at"
                  inputFormat="dd.MM.yy"
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

            <TextField
              id="add-receiver"
              variant="outlined"
              label="Receiver"
              name="receiver"
              sx={FormStyle}
              onChange={addFormHandler.inputChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="add-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                type="number"
                label="Amount"
                name="amount"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={addFormHandler.inputChange}
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
              onChange={addFormHandler.inputChange}
            />
          </form>
        )}
      </FormDrawer>

      {/* Edit Subscription */}
      <FormDrawer
        open={Object.keys(editForm).length > 0}
        heading="Edit Subscription"
        onClose={editFormHandler.close}
        onSave={editFormHandler.save}
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
                defaultValue={getCategory(Number(editForm.category), categories)}
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
                defaultValue={getPaymentMethod(Number(editForm.paymentMethod), paymentMethods)}
                onChange={(event, value) =>
                  editFormHandler.autocompleteChange(event, 'paymentMethod', Number(value?.value))
                }
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>

            <TextField
              id="edit-receiver"
              variant="outlined"
              label="Receiver"
              name="receiver"
              sx={FormStyle}
              defaultValue={editForm.receiver}
              onChange={editFormHandler.inputChange}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="edit-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                type="number"
                name="amount"
                label="Amount"
                defaultValue={editForm.amount}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={editFormHandler.inputChange}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="edit-information"
              variant="outlined"
              label="Information"
              name="information"
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
