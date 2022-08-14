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
import type { IBaseTransactionDTO, ITransaction } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { format } from 'date-fns';
import { StoreContext } from '../context/store.context';
import { getCategoryFromList } from '../utils/getCategoryFromList';
import { getPaymentMethodFromList } from '../utils/getPaymentMethodFromList';
import { TransactionService } from '../services/transaction.service';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export async function getTransactions(): Promise<ITransaction[] | null> {
  return new Promise(async (res, rej) => {
    const { data, error } = await supabase
      .from<ITransaction>('transactions')
      .select(
        `
          id,
          amount,
          receiver,
          description, 
          date,
          updated_at,
          inserted_at,
          paymentMethods (
            id, name, address, provider, description
          ),
          categories (
            id, name, description
          )`
      )
      .order('date', { ascending: false });
    if (error) rej(error);
    res(data);
  });
}

export const Transactions = () => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, transactions, setTransactions, categories, paymentMethods } =
    useContext(StoreContext);
  const screenSize = useScreenSize();
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = useState('');
  const [shownTransactions, setShownTransactions] = useState<readonly ITransaction[]>(transactions);
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
    open: () => {
      setShowAddForm(true);
    },
    close: () => {
      setShowAddForm(false);
      setAddForm({});
      setErrorMessage('');
    },
    dateChange: (date: Date | null) => {
      setAddForm((prev) => ({ ...prev, date: date || new Date() }));
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
        if (!values.includes('paymentMethod')) throw new Error('Provide an paymentMethod');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount')) throw new Error('Provide an amount');

        const data = await TransactionService.createTransactions([
          {
            date: addForm.date || new Date(),
            category: addForm.category,
            paymentMethod: addForm.paymentMethod,
            receiver: addForm.receiver,
            amount: typeof addForm.amount === 'string' ? Number(addForm.amount) : addForm.amount,
            description: addForm.information || null,
            // @ts-ignore
            created_by: session?.user?.id,
          } as IBaseTransactionDTO,
        ]);
        if (data === null) throw new Error('No transaction created');

        setTransactions((prev) => [
          {
            ...data[0],
            categories: categories.find((value) => value.id === data[0].category),
            paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
          } as ITransaction,
          ...prev,
        ]);
        addFormHandler.close();
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

  const editFormHandler = {
    open: ({
      id,
      date,
      categories,
      paymentMethods,
      receiver,
      amount,
      description,
    }: ITransaction) => {
      setEditForm({
        id,
        date,
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
      setEditForm((prev) => ({ ...prev, date: date || new Date() }));
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
        if (!values.includes('date')) throw new Error('Provide an date');
        if (!values.includes('category')) throw new Error('Provide an category');
        if (!values.includes('paymentMethod')) throw new Error('Provide an payment method');
        if (!values.includes('receiver')) throw new Error('Provide an receiver');
        if (!values.includes('amount') || Number(editForm.amount) === 0)
          throw new Error('Provide an amount');

        const update = {
          id: editForm.id,
          date: editForm.date,
          category: editForm.category,
          paymentMethod: editForm.paymentMethod,
          receiver: editForm.receiver,
          amount: Number(editForm.amount),
          description: editForm.information || null,
          // @ts-ignore
          created_by: session?.user?.id,
        };

        const data = await TransactionService.updateTransaction(
          Number(editForm.id),
          update as IBaseTransactionDTO
        );
        if (data === null) throw new Error('No transaction updated');

        editFormHandler.close();
        // @ts-ignore
        setTransactions((prev) =>
          prev.map((transaction) => {
            if (transaction.id === data[0].id) {
              return {
                ...transaction,
                ...data[0],
                categories: categories.find((category) => category.id === data[0].category),
                paymentMethods: paymentMethods.find(
                  (paymentMethod) => paymentMethod.id === data[0].paymentMethod
                ),
              };
            }
            return transaction;
          })
        );
        showSnackbar({
          message: 'Transaction updated',
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
      const data = await TransactionService.deleteTransactionById(id);
      if (data === null) throw new Error('No transaction deleted');
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
      showSnackbar({ message: `Transaction ${data[0].receiver} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete transaction`,
        action: <Button onClick={() => handleDelete(id)}>Retry</Button>,
      });
    }
  };

  useEffect(() => setShownTransactions(transactions), [transactions]);

  useEffect(() => {
    if (transactions.length === 0) return;
    if (keyword === '') setShownTransactions(transactions);
    setShownTransactions(
      transactions.filter(
        (item) =>
          item.categories.name.toLowerCase().includes(keyword) ||
          item.paymentMethods.name.toLowerCase().includes(keyword) ||
          item.description?.toString().toLowerCase().includes(keyword)
      )
    );
  }, [keyword, transactions]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Transactions" description="What have you bought today?" />

      <Grid item xs={12} md={12}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Manage your transactions</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <SearchInput sx={{ mr: '.5rem' }} onSearch={handleOnSearch} />
              <Tooltip title="Add Transaction">
                <IconButton aria-label="add-transactions" onClick={addFormHandler.open}>
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
                <Table sx={{ minWidth: 650 }} aria-label="Transaction Table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Receiver</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Information</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shownTransactions
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
                            <Typography fontWeight="bold">{`${format(
                              new Date(row.date),
                              'dd.MM.yy'
                            )}`}</Typography>
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
                count={shownTransactions.length}
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

      {/* Add Transaction */}
      <FormDrawer
        open={showAddForm}
        heading="Add Transaction"
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
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={addForm.date || new Date()}
                  onChange={addFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={addForm.date || new Date()}
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
                label="Amount"
                name="amount"
                // type="number"
                // inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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

      {/* Edit Transaction */}
      <FormDrawer
        open={Object.keys(editForm).length > 0}
        heading="Edit Transaction"
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
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={editForm.date}
                  onChange={editFormHandler.dateChange}
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={editForm.date}
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
                name="amount"
                label="Amount"
                defaultValue={editForm.amount}
                // type="number"
                // inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
