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
import { format } from 'date-fns';
import React from 'react';
import {
  ActionPaper,
  Card,
  CategoryChip,
  CircularProgress,
  CreateTransaction,
  EarningsByCategory,
  EditTransaction,
  InitialTablePaginationState,
  Linkify,
  NoResults,
  PageHeader,
  PaymentMethodChip,
  SearchInput,
  ShowFilterButton,
  TablePagination,
  TablePaginationHandler,
  TablePaginationReducer,
  UsedByPaymentMethod,
} from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { Transaction } from '../models';
import { filterTransactions } from '../utils';

interface TransactionHandler {
  onSearch: (text: string) => void;
  onAddTransaction: (show: boolean) => void;
  onTransactionDelete: (transaction: Transaction) => void;
  pagination: TablePaginationHandler;
}

export const Transactions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const {
    loading,
    filter,
    transactions,
    setTransactions,
    categories,
    paymentMethods,
    subscriptions,
  } = React.useContext(StoreContext);
  const [keyword, setKeyword] = React.useState('');
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
  const [tablePagination, setTablePagination] = React.useReducer(
    TablePaginationReducer,
    InitialTablePaginationState
  );

  const handler: TransactionHandler = {
    onSearch(text) {
      setKeyword(text.toLowerCase());
    },
    onAddTransaction(show) {
      setShowAddForm(show);
    },
    async onTransactionDelete(transaction) {
      try {
        const deletedTransactions = await transaction.delete();
        if (!deletedTransactions || deletedTransactions.length < 0)
          throw new Error('No transaction deleted');
        startTransition(() => {
          setTransactions((prev) => prev.filter(({ id }) => id !== transaction.id));
        });
        showSnackbar({ message: `Transaction ${transaction.receiver} deleted` });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: `Could'nt delete transaction`,
          action: <Button onClick={() => handler.onTransactionDelete(transaction)}>Retry</Button>,
        });
      }
    },
    pagination: {
      onPageChange(newPage) {
        setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
      },
    },
  };

  const shownTransactions: Transaction[] = React.useMemo(() => {
    return filterTransactions(keyword, filter, transactions);
  }, [transactions, keyword, filter]);

  const currentPageTransactions: Transaction[] = React.useMemo(() => {
    const { page, rowsPerPage } = tablePagination;
    return shownTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownTransactions, tablePagination]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Transactions" description="What have you bought today?" />

      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Manage your transactions</Card.Subtitle>
            </Box>
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <ShowFilterButton />
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Transaction">
                  <IconButton color="primary" onClick={() => handler.onAddTransaction(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : transactions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Transaction Table">
                    <TableHead>
                      <TableRow>
                        {[
                          'Date',
                          'Category',
                          'Receiver',
                          'Amount',
                          'Payment Method',
                          'Information',
                          '',
                        ].map((cell, index) => (
                          <TableCell key={index}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPageTransactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="bolder">{`${format(
                              new Date(transaction.date),
                              'dd.MM.yy'
                            )}`}</Typography>
                          </TableCell>
                          <TableCell>
                            <CategoryChip category={transaction.categories} />
                          </TableCell>
                          <TableCell>
                            <Linkify>{transaction.receiver}</Linkify>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {transaction.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <PaymentMethodChip paymentMethod={transaction.paymentMethods} />
                          </TableCell>
                          <TableCell>
                            <Linkify>{transaction.description ?? 'No information'}</Linkify>
                          </TableCell>
                          <TableCell align="right">
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  color="primary"
                                  onClick={() => setEditTransaction(transaction)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  color="primary"
                                  onClick={() => handler.onTransactionDelete(transaction)}
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
                <TablePagination
                  {...tablePagination}
                  count={shownTransactions.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No transactions found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!loading && <EarningsByCategory categories={categories} transactions={transactions} />}
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!loading && (
          <UsedByPaymentMethod
            paymentMethods={paymentMethods}
            transactions={transactions}
            subscriptions={subscriptions}
          />
        )}
      </Grid>

      <CreateTransaction open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditTransaction
        open={editTransaction !== null}
        setOpen={(show) => {
          if (!show) setEditTransaction(null);
        }}
        transaction={editTransaction}
      />
    </Grid>
  );
};
