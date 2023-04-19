import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
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
  UsedByPaymentMethod,
} from '../components';
import { CreateFab } from '../components/Base/CreateFab/CreateFab.component';
import { SnackbarContext, StoreContext } from '../context';
import { useFetchCategories, useFetchPaymentMethods, useFetchSubscriptions, useFetchTransactions } from '../hooks';
import { Transaction } from '../models';
import { TablePaginationReducer } from '../reducer';
import { DescriptionTableCellStyle } from '../theme/description-table-cell.style';
import { filterTransactions } from '../utils';

interface TransactionHandler {
  onSearch: (text: string) => void;
  onAddTransaction: (show: boolean) => void;
  onTransactionDelete: (transaction: Transaction) => void;
  pagination: TablePaginationHandler;
}

export const Transactions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { filter, setTransactions } = React.useContext(StoreContext);
  const fetchTransactions = useFetchTransactions();
  const fetchSubscriptions = useFetchSubscriptions();
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [keyword, setKeyword] = React.useState('');
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selected, setSelected] = React.useState<Transaction['id'][]>([]);
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
  const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      startTransition(() => {
        setSelected(
          selected.length > 0 && selected.length < shownTransactions.length ? [] : shownTransactions.map(({ id }) => id)
        );
      });
    } else {
      setSelected([]);
    }
  };

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
        if (!deletedTransactions || deletedTransactions.length < 0) throw new Error('No transaction deleted');
        startTransition(() => {
          setTransactions({
            type: 'REMOVE_BY_ID',
            id: transaction.id,
          });
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
    if (!fetchTransactions.transactions) return [];
    return filterTransactions(keyword, filter, fetchTransactions.transactions);
  }, [fetchTransactions.transactions, keyword, filter]);

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
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
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
          {fetchTransactions.loading ? (
            <CircularProgress />
          ) : shownTransactions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                {selected.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderLeftWidth: 0,
                      borderRightWidth: 0,
                      mt: 1,
                      py: 1,
                      px: 2,
                    }}
                  >
                    <Typography>{selected.length} selected</Typography>

                    <Button startIcon={<EditIcon />} size="small" sx={{ ml: 2 }}>
                      Edit
                    </Button>
                    <Button startIcon={<DeleteIcon />} size="small" sx={{ ml: 1 }}>
                      Delete
                    </Button>
                  </Box>
                )}

                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Transaction Table">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            onChange={handleSelectAll}
                            indeterminate={selected.length > 0 && selected.length < shownTransactions.length}
                            checked={selected.length === shownTransactions.length && selected.length > 0}
                          />
                        </TableCell>
                        {['Date', 'Category', 'Receiver', 'Amount', 'Payment Method', 'Information', ''].map(
                          (cell, index) => (
                            <TableCell key={index}>
                              <Typography fontWeight="bolder">{cell}</Typography>
                            </TableCell>
                          )
                        )}
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
                            <Checkbox
                              onChange={() => {
                                startTransition(() => {
                                  setSelected((prev: number[]) => {
                                    if (prev.includes(transaction.id)) {
                                      return prev.filter((id) => id !== transaction.id);
                                    } else return [...prev, transaction.id];
                                  });
                                });
                              }}
                              checked={selected.includes(transaction.id)}
                            />
                          </TableCell>
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
                          <TableCell sx={DescriptionTableCellStyle}>
                            <Linkify>{transaction.description ?? 'No information'}</Linkify>
                          </TableCell>
                          <TableCell align="right">
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton color="primary" onClick={() => setEditTransaction(transaction)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton color="primary" onClick={() => handler.onTransactionDelete(transaction)}>
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
            <NoResults sx={{ m: 2 }} text="No transactions found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!fetchCategories.loading && !fetchTransactions.loading && (
          <EarningsByCategory categories={fetchCategories.categories} transactions={fetchTransactions.transactions} />
        )}
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!fetchPaymentMethods.loading && !fetchTransactions.loading && !fetchSubscriptions.subscriptions && (
          <UsedByPaymentMethod
            paymentMethods={fetchPaymentMethods.paymentMethods}
            transactions={fetchTransactions.transactions}
            subscriptions={fetchSubscriptions.subscriptions}
          />
        )}
      </Grid>

      <CreateFab onClick={() => handler.onAddTransaction(true)} />

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
