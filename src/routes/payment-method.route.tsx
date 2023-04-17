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
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ActionPaper,
  Card,
  CircularProgress,
  CreatePaymentMethod,
  EarningsByPaymentMethod,
  EditPaymentMethod,
  InitialTablePaginationState,
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
  TablePagination,
  TablePaginationHandler,
  UsedByPaymentMethod,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { useFetchPaymentMethods, useFetchSubscriptions, useFetchTransactions } from '../hooks';
import { PaymentMethod } from '../models';
import { TablePaginationReducer } from '../reducer';

interface PaymentMethodHandler {
  onSearch: (keyword: string) => void;
  pagination: TablePaginationHandler;
  paymentMethod: {
    onDelete: (paymentMethod: PaymentMethod) => void;
  };
}

export const PaymentMethods = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { setPaymentMethods } = React.useContext(StoreContext);
  const fetchTransactions = useFetchTransactions();
  const fetchSubscriptions = useFetchSubscriptions();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<PaymentMethod | null>(null);
  const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);

  const handler: PaymentMethodHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    pagination: {
      onPageChange(newPage) {
        setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
      },
    },
    paymentMethod: {
      async onDelete(paymentMethod) {
        try {
          const deletedPaymentMethods = await paymentMethod.delete();
          if (!deletedPaymentMethods || deletedPaymentMethods.length < 1) throw new Error('No payment-method deleted');
          startTransition(() => {
            setPaymentMethods({ type: 'REMOVE_BY_ID', id: paymentMethod.id });
          });
          showSnackbar({ message: `Payment Method ${paymentMethod.name} deleted` });
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: `Could'nt delete payment method`,
            action: <Button onClick={() => handler.paymentMethod.onDelete(paymentMethod)}>Retry</Button>,
          });
        }
      },
    },
  };

  const shownPaymentMethods: PaymentMethod[] = React.useMemo(() => {
    if (keyword === '') return fetchPaymentMethods.paymentMethods;
    return fetchPaymentMethods.paymentMethods.filter(
      (item) => item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
    );
  }, [keyword, fetchPaymentMethods.paymentMethods]);

  const currentPagePaymentMethods: PaymentMethod[] = React.useMemo(() => {
    const { page, rowsPerPage } = tablePagination;
    return shownPaymentMethods.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownPaymentMethods, tablePagination]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Payment Methods" description="How are u paying today, sir?" />

      <Grid item xs={12} md={9} lg={8} xl={9} order={{ xs: 1, md: 0 }}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Payment Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%' } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Payment Method">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {fetchPaymentMethods.loading ? (
            <CircularProgress />
          ) : fetchPaymentMethods.paymentMethods.length > 0 ? (
            <React.Fragment>
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
                      {currentPagePaymentMethods.map((row) => (
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
                                <IconButton color="primary" onClick={() => setEditPaymentMethod(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton color="primary" onClick={() => handler.paymentMethod.onDelete(row)}>
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
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <TablePagination
                  {...tablePagination}
                  count={shownPaymentMethods.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ m: 2 }} text="No payment-methods found" />
          )}
        </Card>
      </Grid>

      <Grid container item xs={12} md={3} lg={4} xl={3} spacing={3} order={{ xs: 0, md: 1 }}>
        <Grid item xs={12}>
          {!fetchPaymentMethods.loading && !fetchSubscriptions.loading && !fetchTransactions.loading && (
            <UsedByPaymentMethod
              paymentMethods={fetchPaymentMethods.paymentMethods}
              transactions={fetchTransactions.transactions}
              subscriptions={fetchSubscriptions.subscriptions}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          {!fetchPaymentMethods.loading && !fetchTransactions.loading && (
            <EarningsByPaymentMethod
              paymentMethods={fetchPaymentMethods.paymentMethods}
              transactions={fetchTransactions.transactions}
            />
          )}
        </Grid>
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
