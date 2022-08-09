import { useContext, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '../components/card.component';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { SxProps, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/search-input.component';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import type {
  IBaseTransactionDTO,
  ICategory,
  IPaymentMethod,
  ITransactioDTO,
  ITransaction,
} from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { format } from 'date-fns';
import { FormDrawer } from '../components/form-drawer.component';
import { useScreenSize } from '../hooks/useScreenSize.hook';
import { getCategories } from './categories.route';
import { getPaymentMethods } from './payment-method.route';

function getCategory(
  categoryId: number,
  categories: ICategory[]
): { label: string; value: number } {
  const match = categories.find((category) => category.id === categoryId);
  if (!match) {
    const { id, name } = categories[0]; // Fallback
    return {
      label: name,
      value: id,
    };
  } else return { label: match?.name, value: match.id };
}

function getPaymentMethod(
  paymentMethodId: number,
  paymentMethods: IPaymentMethod[]
): { label: string; value: number } {
  const match = paymentMethods.find((paymentMethod) => paymentMethod.id === paymentMethodId);
  if (!match) {
    const { id, name, provider } = paymentMethods[0];
    return {
      label: `${name} • ${provider}`,
      value: id,
    };
  } else return { label: `${match?.name} • ${match?.provider}`, value: match.id };
}

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
  const screenSize = useScreenSize();
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [shownTransactions, setShownTransactions] = useState<readonly ITransaction[]>(transactions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [addTransaction, setAddTransaction] = useState({
    date: new Date(),
  } as IBaseTransactionDTO);
  const [editTransaction, setEditTransaction] = useState<ITransactioDTO | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddFormOpen = () => setShowAddForm(true);

  const handleAddFormClose = () => {
    setShowAddForm(false);
    setAddTransaction({ date: new Date() } as IBaseTransactionDTO);
    setErrorMessage('');
  };

  const handleAddFormSubmit = async () => {
    try {
      const { category, paymentMethod, receiver, amount, date } = addTransaction;

      if (!date) setAddTransaction((prev) => ({ ...prev, date: new Date() }));
      if (!category) setAddTransaction((prev) => ({ ...prev, category: categories[0].id }));
      if (!paymentMethod)
        setAddTransaction((prev) => ({ ...prev, paymentMethod: paymentMethods[0].id }));
      if (!receiver) throw new Error('Provide an valid receiver');
      if (!amount) throw new Error("'Provide an valid amount'");

      const { data, error } = await supabase
        .from<IBaseTransactionDTO>('transactions')
        // @ts-ignore
        .insert([{ ...addTransaction, created_by: session.user?.id }]);
      if (error) throw error;

      setTransactions((prev) => [
        {
          ...data[0],
          categories: categories.find((value) => value.id === data[0].category),
          paymentMethods: paymentMethods.find((value) => value.id === data[0].paymentMethod),
        } as ITransaction,
        ...prev,
      ]);
      handleAddFormClose();
      showSnackbar({
        message: 'Transaction added',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  const handleEditFormOpen = (transaction: ITransaction) => {
    setEditTransaction({
      ...transaction,
      category: transaction.categories.id,
      paymentMethod: transaction.paymentMethods.id,
    });
  };

  const handleEditFormClose = () => {
    setEditTransaction(null);
    setErrorMessage('');
  };

  const handleEditFormSubmit = async () => {
    try {
      if (!editTransaction) throw new Error('No Transaction provided');

      const { id, category, paymentMethod, amount, receiver, description, date } = editTransaction;
      const { data, error } = await supabase.from('transactions').upsert({
        id,
        category,
        paymentMethod,
        amount,
        receiver,
        description,
        date,
        created_by: session?.user?.id,
      });
      if (error) throw error;

      setTransactions((prev) => {
        let updatedTransactions = prev;
        const outdatedItemIndex = updatedTransactions.findIndex(
          (transaction) => transaction.id === data[0].id
        );
        updatedTransactions[outdatedItemIndex] = {
          ...data[0],
          id: data[0].id!,
          categories: categories.find((category) => category.id === data[0].category)!,
          paymentMethods: paymentMethods.find(
            (paymentMethod) => paymentMethod.id === data[0].paymentMethod
          )!,
        };
        return updatedTransactions;
      });
      handleEditFormClose();
      showSnackbar({
        message: 'Transaction updated',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from<IBaseTransactionDTO>('transactions')
        .delete()
        .match({ id: id });
      if (error) throw error;
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
    if (keyword === '') setShownTransactions(transactions);
    setShownTransactions(
      transactions.filter(
        (item) =>
          item.categories.name.toLowerCase().includes(keyword) ||
          item.paymentMethods.name.toLowerCase().includes(keyword) ||
          item.description?.toString().toLowerCase().includes(keyword)
      )
    );
  }, [keyword]);

  useEffect(() => {
    Promise.all([getTransactions(), getCategories(), getPaymentMethods()])
      .then(([getTransactions, getCategories, getPaymentMethods]) => {
        if (getTransactions) {
          setTransactions(getTransactions);
        } else setTransactions([]);

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
                <IconButton aria-label="add-transactions" onClick={handleAddFormOpen}>
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
                          <TableCell>{row.categories.name}</TableCell>
                          <TableCell>{row.receiver}</TableCell>
                          <TableCell>
                            {row.amount.toLocaleString('de', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </TableCell>
                          <TableCell>{row.paymentMethods.name}</TableCell>
                          <TableCell>{row.description || 'No Information'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit" placement="top">
                              <IconButton onClick={() => handleEditFormOpen(row)}>
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
        onClose={handleAddFormClose}
        onSave={handleAddFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {screenSize === 'small' ? (
              <MobileDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={new Date()}
                onChange={(value) =>
                  setAddTransaction((prev) => ({ ...prev, date: value || new Date() }))
                }
                renderInput={(params) => <TextField sx={FormStyle} {...params} />}
              />
            ) : (
              <DesktopDatePicker
                label="Date"
                inputFormat="dd.MM.yy"
                value={new Date()}
                onChange={(value) =>
                  setAddTransaction((prev) => ({ ...prev, date: value || new Date() }))
                }
                renderInput={(params) => <TextField sx={FormStyle} {...params} />}
              />
            )}
          </LocalizationProvider>

          {!loading && (
            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Autocomplete
                id="add-category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                onChange={(_event, value) => {
                  setAddTransaction((prev) => ({
                    ...prev,
                    category: Number(value?.value),
                  }));
                }}
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
                onChange={(_event, value) => {
                  setAddTransaction((prev) => ({
                    ...prev,
                    paymentMethod: Number(value?.value),
                  }));
                }}
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>
          )}

          <TextField
            id="add-receiver"
            variant="outlined"
            label="Receiver"
            sx={FormStyle}
            onChange={(e) => setAddTransaction((prev) => ({ ...prev, receiver: e.target.value }))}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="add-amount">Amount</InputLabel>
            <OutlinedInput
              id="add-amount"
              type="number"
              onChange={(e) =>
                setAddTransaction((prev) => ({ ...prev, amount: Number(e.target.value) }))
              }
              label="Amount"
              startAdornment={<InputAdornment position="start">€</InputAdornment>}
            />
          </FormControl>

          <TextField
            id="add-information"
            variant="outlined"
            label="Information"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            onChange={(e) =>
              setAddTransaction((prev) => ({
                ...prev,
                description: e.target.value === '' ? null : e.target.value,
              }))
            }
          />
        </form>
      </FormDrawer>

      {/* Edit Transaction */}
      <FormDrawer
        open={editTransaction !== null}
        heading="Edit Transaction"
        onClose={handleEditFormClose}
        onSave={handleEditFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {editTransaction && !loading && (
          <form>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {screenSize === 'small' ? (
                <MobileDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={editTransaction.date}
                  onChange={(value) =>
                    setEditTransaction((prev) => ({ ...prev!, date: value || new Date() }))
                  }
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              ) : (
                <DesktopDatePicker
                  label="Date"
                  inputFormat="dd.MM.yy"
                  value={editTransaction.date}
                  onChange={(value) =>
                    setEditTransaction((prev) => ({ ...prev!, date: value || new Date() }))
                  }
                  renderInput={(params) => <TextField sx={FormStyle} {...params} />}
                />
              )}
            </LocalizationProvider>

            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Autocomplete
                id="edit-category"
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                sx={{ width: 'calc(50% - .5rem)', mb: 2 }}
                defaultValue={getCategory(editTransaction.category, categories)}
                onChange={(_event, value) => {
                  setEditTransaction((prev) => ({
                    ...prev!,
                    category: Number(value?.value),
                  }));
                }}
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
                defaultValue={getPaymentMethod(editTransaction.paymentMethod, paymentMethods)}
                onChange={(_event, value) => {
                  setEditTransaction((prev) => ({
                    ...prev!,
                    paymentMethod: Number(value?.value),
                  }));
                }}
                renderInput={(props) => <TextField {...props} label="Payment Method" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </Box>

            <TextField
              id="edit-receiver"
              variant="outlined"
              label="Receiver"
              sx={FormStyle}
              defaultValue={editTransaction.receiver}
              onChange={(e) =>
                setEditTransaction((prev) => ({ ...prev!, receiver: e.target.value }))
              }
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="edit-amount">Amount</InputLabel>
              <OutlinedInput
                id="add-amount"
                type="number"
                defaultValue={editTransaction.amount}
                onChange={(e) =>
                  setEditTransaction((prev) => ({ ...prev!, amount: Number(e.target.value) }))
                }
                label="Amount"
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>

            <TextField
              id="edit-information"
              variant="outlined"
              label="Information"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              defaultValue={editTransaction.description}
              onChange={(e) =>
                setEditTransaction((prev) => ({
                  ...prev!,
                  description: e.target.value === '' ? null : e.target.value,
                }))
              }
            />
          </form>
        )}
      </FormDrawer>
    </Grid>
  );
};
