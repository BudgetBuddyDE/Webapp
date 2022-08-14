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
  TextField,
  Alert,
  Button,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/search-input.component';
import { AuthContext } from '../context/auth.context';
import type { IPaymentMethod } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { FormDrawer } from '../components/form-drawer.component';
import { StoreContext } from '../context/store.context';
import { PaymentMethodService } from '../services/payment-method.service';

const FormStyle: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

export const PaymentMethods = () => {
  const { session } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { loading, paymentMethods, setPaymentMethods } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [shownPaymentMethods, setShownPaymentMethods] =
    useState<readonly IPaymentMethod[]>(paymentMethods);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const [addForm, setAddForm] = useState<Record<string, string | number>>({});
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});

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
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAddForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    save: async () => {
      try {
        const values = Object.keys(addForm);
        if (!values.includes('name')) throw new Error('Provide an name');
        if (!values.includes('address')) throw new Error('Provide an address');
        if (!values.includes('provider')) throw new Error('Provide an provider');

        const data = await PaymentMethodService.createPaymentMethods([
          {
            name: addForm.name,
            address: addForm.address,
            provider: addForm.provider,
            description: addForm.description || null,
            // @ts-ignore
            created_by: session?.user.id,
          } as IPaymentMethod,
        ]);
        if (data === null) throw new Error('No payment-method created');

        setPaymentMethods((prev) => [...prev, ...data]);
        addFormHandler.close();
        showSnackbar({
          message: 'Payment Method added',
        });
      } catch (error) {
        console.error(error);
        // @ts-ignore
        setErrorMessage(error.message || 'Unkown error');
      }
    },
  };

  const editFormHandler = {
    open: ({ id, name, address, provider, description }: IPaymentMethod) => {
      setEditForm({ id, name, address, provider, description: description || '' });
    },
    close: () => {
      setEditForm({});
      setErrorMessage('');
    },
    inputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    },
    save: async () => {
      try {
        const values = Object.keys(editForm);
        if (!values.includes('id')) throw new Error('Provide an id');
        if (!values.includes('name')) throw new Error('Provide an name');
        if (!values.includes('address')) throw new Error('Provide an address');
        if (!values.includes('provider')) throw new Error('Provide an provider');

        const update = {
          name: editForm.name,
          address: editForm.address,
          provider: editForm.provider,
          description: editForm.description || null,
          // @ts-ignore
          created_by: session?.user.id,
        };

        const data = await PaymentMethodService.updatePaymentMethod(
          Number(editForm.id),
          update as Partial<IPaymentMethod>
        );
        if (data === null) throw new Error('No payment-method updated');

        setPaymentMethods((prev) =>
          prev.map((paymentMethod) => {
            if (paymentMethod.id === data[0].id) {
              return {
                ...paymentMethod,
                name: editForm.name.toString(),
                address: editForm.address.toString(),
                provider: editForm.provider.toString(),
                description: editForm.description.toString(),
              };
            }
            return paymentMethod;
          })
        );
        editFormHandler.close();
        showSnackbar({
          message: 'Payment method updated',
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
      const data = await PaymentMethodService.deletePaymentMethodById(id);
      if (data === null) throw new Error('No payment-method deleted');
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

  useEffect(() => setShownPaymentMethods(paymentMethods), [paymentMethods]);

  useEffect(() => {
    if (keyword === '') setShownPaymentMethods(paymentMethods);
    setShownPaymentMethods(
      paymentMethods.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
      )
    );
  }, [keyword, paymentMethods]);

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
                <IconButton aria-label="add-payment-method" onClick={addFormHandler.open}>
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
        onClose={addFormHandler.close}
        onSave={addFormHandler.save}
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
            name="name"
            sx={FormStyle}
            onChange={addFormHandler.inputChange}
          />

          <TextField
            id="add-pm-provider"
            variant="outlined"
            label="Provider"
            name="provider"
            sx={FormStyle}
            onChange={addFormHandler.inputChange}
          />

          <TextField
            id="add-pm-address"
            variant="outlined"
            label="Address"
            name="address"
            sx={FormStyle}
            onChange={addFormHandler.inputChange}
          />

          <TextField
            id="add-pm-description"
            variant="outlined"
            label="Description"
            name="description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            onChange={addFormHandler.inputChange}
          />
        </form>
      </FormDrawer>

      {/* Edit Payment Method */}
      <FormDrawer
        open={Object.keys(editForm).length > 0}
        heading="Edit Payment Method"
        onClose={editFormHandler.close}
        onSave={editFormHandler.save}
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
            name="name"
            sx={FormStyle}
            defaultValue={editForm.name}
            onChange={editFormHandler.inputChange}
          />

          <TextField
            id="add-pm-provider"
            variant="outlined"
            label="Provider"
            name="provider"
            sx={FormStyle}
            defaultValue={editForm.provider}
            onChange={editFormHandler.inputChange}
          />

          <TextField
            id="add-pm-address"
            variant="outlined"
            label="Address"
            name="address"
            sx={FormStyle}
            defaultValue={editForm.address}
            onChange={editFormHandler.inputChange}
          />

          <TextField
            id="add-pm-description"
            variant="outlined"
            label="Description"
            name="description"
            sx={{ ...FormStyle, mb: 0 }}
            multiline
            rows={3}
            defaultValue={editForm.description}
            onChange={editFormHandler.inputChange}
          />
        </form>
      </FormDrawer>
    </Grid>
  );
};
