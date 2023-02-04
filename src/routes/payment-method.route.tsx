import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ActionPaper,
  CircularProgress,
  CreatePaymentMethod,
  EditPaymentMethod,
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
} from '../components';
import Card from '../components/card.component';
import { SnackbarContext, StoreContext } from '../context';
import { PaymentMethod } from '../models';

export const PaymentMethods = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, paymentMethods, setPaymentMethods } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [shownPaymentMethods, setShownPaymentMethods] =
    React.useState<readonly PaymentMethod[]>(paymentMethods);
  const [page, setPage] = React.useState(0);
  const [, startTransition] = React.useTransition();
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<PaymentMethod | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (paymentMethod: PaymentMethod) => {
    try {
      const deletedPaymentMethods = await paymentMethod.delete();
      if (!deletedPaymentMethods || deletedPaymentMethods.length < 1)
        throw new Error('No payment-method deleted');
      startTransition(() => {
        setPaymentMethods((prev) => prev.filter(({ id }) => id !== paymentMethod.id));
      });
      showSnackbar({ message: `Payment Method ${paymentMethod.name} deleted` });
    } catch (error) {
      console.error(error);
      showSnackbar({
        message: `Could'nt delete payment method`,
        action: <Button onClick={() => handleDelete(paymentMethod)}>Retry</Button>,
      });
    }
  };

  React.useEffect(() => setShownPaymentMethods(paymentMethods), [paymentMethods]);

  React.useEffect(() => {
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
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <SearchInput onSearch={handleOnSearch} />
                <Tooltip title="Add Payment Method">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : paymentMethods.length > 0 ? (
            <>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Payment Methods Table">
                    <TableHead>
                      <TableRow>
                        {['Name', 'Provider', 'Address', 'Description', ''].map((cell, index) => (
                          <TableCell key={index}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
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
                            <TableCell>
                              <Typography>{row.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.provider}</Linkify>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.address}</Linkify>
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.description ?? 'No description'}</Linkify>
                            </TableCell>
                            <TableCell align="right">
                              <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                <Tooltip title="Edit" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => setEditPaymentMethod(row)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                  <IconButton color="primary" onClick={() => handleDelete(row)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </ActionPaper>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer>
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownPaymentMethods.length}
                    page={page}
                    onPageChange={handlePageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No payment-methods found" />
          )}
        </Card>
      </Grid>

      <CreatePaymentMethod open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditPaymentMethod
        open={editPaymentMethod !== null}
        setOpen={(show) => {
          if (!show) setEditPaymentMethod(null);
        }}
        paymentMethod={editPaymentMethod}
      />
    </Grid>
  );
};
