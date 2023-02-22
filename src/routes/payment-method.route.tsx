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
  Card,
  CircularProgress,
  CreatePaymentMethod,
  EarningsByPaymentMethod,
  EditPaymentMethod,
  Linkify,
  NoResults,
  PageHeader,
  SearchInput,
  UsedByPaymentMethod,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { useScreenSize } from '../hooks';
import { PaymentMethod } from '../models';

interface PaymentMethodHandler {
  onSearch: (keyword: string) => void;
  paginator: {
    onPageChange: (event: unknown, newPage: number) => void;
    onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  paymentMethod: {
    onDelete: (paymentMethod: PaymentMethod) => void;
  };
}

const rowsPerPageOptions = [10, 25, 50, 100];

export const PaymentMethods = () => {
  const screenSize = useScreenSize();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, transactions, subscriptions, paymentMethods, setPaymentMethods } =
    React.useContext(StoreContext);
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<PaymentMethod | null>(null);

  const handler: PaymentMethodHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    paginator: {
      onPageChange(event, newPage) {
        setPage(newPage);
      },
      onChangeRowsPerPage(event) {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      },
    },
    paymentMethod: {
      async onDelete(paymentMethod) {
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
            action: (
              <Button onClick={() => handler.paymentMethod.onDelete(paymentMethod)}>Retry</Button>
            ),
          });
        }
      },
    },
  };

  const shownPaymentMethods: PaymentMethod[] = React.useMemo(() => {
    if (keyword === '') return paymentMethods;
    return paymentMethods.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
    );
  }, [keyword, paymentMethods]);

  const currentPagePaymentMethods: PaymentMethod[] = React.useMemo(() => {
    return shownPaymentMethods.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownPaymentMethods, page, rowsPerPage]);

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
            <Card.HeaderActions>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <SearchInput onSearch={handler.onSearch} />
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
                                <IconButton
                                  color="primary"
                                  onClick={() => setEditPaymentMethod(row)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  color="primary"
                                  onClick={() => handler.paymentMethod.onDelete(row)}
                                >
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
                <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                  <TablePagination
                    component="div"
                    count={shownPaymentMethods.length}
                    page={page}
                    onPageChange={handler.paginator.onPageChange}
                    labelRowsPerPage="Rows:"
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handler.paginator.onChangeRowsPerPage}
                  />
                </ActionPaper>
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No payment-methods found" />
          )}
        </Card>
      </Grid>

      <Grid container item xs={12} md={3} lg={4} xl={3} order={{ xs: 0, md: 1 }}>
        <Grid item xs={12}>
          {!loading && (
            <UsedByPaymentMethod
              paymentMethods={paymentMethods}
              transactions={transactions}
              subscriptions={subscriptions}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          {screenSize !== 'small' && !loading && (
            <EarningsByPaymentMethod paymentMethods={paymentMethods} transactions={transactions} />
          )}
        </Grid>
      </Grid>

      {screenSize === 'small' && !loading && (
        <Grid item xs={12} order={{ xs: 2 }}>
          <EarningsByPaymentMethod paymentMethods={paymentMethods} transactions={transactions} />
        </Grid>
      )}

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
