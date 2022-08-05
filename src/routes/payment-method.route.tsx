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
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/search-input.component';
import { supabase } from '../supabase';
import { AuthContext } from '../context/auth.context';
import { IBasePaymentMethod, IPaymentMethod } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export async function getPaymentMethods(): Promise<IPaymentMethod[] | null> {
  return new Promise(async (res, rej) => {
    const { data, error } = await supabase
      .from<IPaymentMethod>('paymentMethods')
      .select('*')
      .order('name', { ascending: true });
    if (error) rej(error);
    res(data);
  });
}

export const PaymentMethods = () => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [shownPaymentMethods, setShownPaymentMethods] =
    useState<readonly IPaymentMethod[]>(paymentMethods);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [addPaymentMethod, setAddPaymentMethod] = useState({} as IBasePaymentMethod);
  const [editPaymentMethod, setEditPaymentMethod] = useState<null | IPaymentMethod>(null);

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
    setErrorMessage('');
  };

  const handleAddFormSubmit = async () => {
    try {
      const { name, provider, address } = addPaymentMethod;

      if (!name) throw new Error('Provide an valid name');
      if (!provider) throw new Error('Provide an valid provider');
      if (!address) throw new Error('Provide an valid address');

      const { data, error } = await supabase
        .from<IPaymentMethod>('paymentMethods')
        .insert([addPaymentMethod]);
      if (error) throw error;

      setPaymentMethods((prev) => [...prev, ...data]);
      handleAddFormClose();
      showSnackbar({
        message: 'Payment Method added',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from<IPaymentMethod>('paymentMethods')
        .delete()
        .match({ id: id });
      if (error) throw error;
      setPaymentMethods((prev) => prev.filter((paymentMethod) => paymentMethod.id !== id));
      showSnackbar({ message: `Payment Method ${data[0].name} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete payment method`,
        action: <Button onClick={() => handleDelete(id)}>Retry</Button>,
      });
    }
  };

  const handleEdit = (paymentMethod: IPaymentMethod) => setEditPaymentMethod(paymentMethod);

  const handleEditFormClose = () => {
    setEditPaymentMethod(null);
    setErrorMessage('');
  };

  const handleEditFormSubmit = async () => {
    try {
      if (!editPaymentMethod) throw new Error('No Payment Method provided');
      const { name, provider, address } = editPaymentMethod;

      if (!name) throw new Error('Provide an valid name');
      if (!provider) throw new Error('Provide an valid provider');
      if (!address) throw new Error('Provide an valid address');

      const { data, error } = await supabase
        .from<IPaymentMethod>('paymentMethods')
        .upsert(editPaymentMethod);
      if (error) throw error;

      setPaymentMethods((prev) => {
        let updatedPaymentMethods = prev;
        const outdatedItemIndex = updatedPaymentMethods.findIndex(
          (paymentMethod) => paymentMethod.id === data[0].id
        );
        updatedPaymentMethods[outdatedItemIndex] = data[0];
        return updatedPaymentMethods;
      });
      handleEditFormClose();
      showSnackbar({
        message: 'Payment Method updated',
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
    }
  };

  useEffect(() => setShownPaymentMethods(paymentMethods), [paymentMethods]);

  useEffect(() => {
    if (keyword === '') setShownPaymentMethods(paymentMethods);
    setShownPaymentMethods(
      paymentMethods.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
      )
    );
  }, [keyword]);

  useEffect(() => {
    getPaymentMethods()
      .then((data) => {
        if (data) {
          setPaymentMethods(data);
        } else setPaymentMethods([]);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Payment Methods" description="How are u paying today, sir?" />

      <Grid item xs={12} md={12} lg={12}>
        <Card>
          <Card.Header>
            <Box>
              <Card.Title>Payment Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
            <Card.HeaderActions>
              <SearchInput sx={{ mr: '.5rem' }} onSearch={handleOnSearch} />
              <Tooltip title="Add Payment Method">
                <IconButton aria-label="add-payment-method" onClick={handleAddFormOpen}>
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
                <Table sx={{ minWidth: 650 }} aria-label="Payment Methods Table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shownPaymentMethods
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.provider}</TableCell>
                          <TableCell>{row.address}</TableCell>
                          <TableCell>{row.description || 'No Description'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit" placement="top">
                              <IconButton onClick={() => handleEdit(row)}>
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
                count={shownPaymentMethods.length}
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

      {/* Add Payment Method */}
      <FormDrawer
        open={showAddForm}
        heading="Add Payment Method"
        onClose={handleAddFormClose}
        onSave={handleAddFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form>
          <TextField
            id="add-pm-name"
            variant="outlined"
            label="Name"
            sx={FormStyle}
            onChange={(e) => setAddPaymentMethod((prev) => ({ ...prev, name: e.target.value }))}
          />

          <TextField
            id="add-pm-provider"
            variant="outlined"
            label="Provider"
            sx={FormStyle}
            onChange={(e) => setAddPaymentMethod((prev) => ({ ...prev, provider: e.target.value }))}
          />

          <TextField
            id="add-pm-address"
            variant="outlined"
            label="Address"
            sx={FormStyle}
            onChange={(e) => setAddPaymentMethod((prev) => ({ ...prev, address: e.target.value }))}
          />

          <TextField
            id="add-pm-description"
            variant="outlined"
            label="Description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            onChange={(e) =>
              setAddPaymentMethod((prev) => ({
                ...prev,
                description: e.target.value === '' ? null : e.target.value,
              }))
            }
          />
        </form>
      </FormDrawer>

      {/* Edit Payment Method */}
      <FormDrawer
        open={editPaymentMethod !== null}
        heading="Edit Payment Method"
        onClose={handleEditFormClose}
        onSave={handleEditFormSubmit}
      >
        {errorMessage.length > 1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {editPaymentMethod && (
          <form>
            <TextField
              id="add-pm-name"
              variant="outlined"
              label="Name"
              sx={FormStyle}
              defaultValue={editPaymentMethod?.name}
              // @ts-ignore
              onChange={(e) => setEditPaymentMethod((prev) => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              id="add-pm-provider"
              variant="outlined"
              label="Provider"
              sx={FormStyle}
              defaultValue={editPaymentMethod?.provider}
              onChange={(e) =>
                // @ts-ignore
                setEditPaymentMethod((prev) => ({ ...prev, provider: e.target.value }))
              }
            />

            <TextField
              id="add-pm-address"
              variant="outlined"
              label="Address"
              sx={FormStyle}
              defaultValue={editPaymentMethod?.address}
              onChange={(e) =>
                // @ts-ignore
                setEditPaymentMethod((prev) => ({ ...prev, address: e.target.value }))
              }
            />

            <TextField
              id="add-pm-description"
              variant="outlined"
              label="Description"
              sx={{ ...FormStyle, mb: 0 }}
              multiline
              rows={3}
              defaultValue={editPaymentMethod?.description}
              onChange={(e) =>
                // @ts-ignore
                setEditPaymentMethod((prev) => ({
                  ...prev,
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
