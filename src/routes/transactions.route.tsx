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
import { format } from 'date-fns';
import React from 'react';
import {
  ActionPaper,
  CategoryChip,
  CircularProgress,
  CreateTransaction,
  EditTransaction,
  Linkify,
  NoResults,
  PageHeader,
  PaymentMethodChip,
  SearchInput,
  ShowFilterButton,
} from '../components';
import Card from '../components/card.component';
import { SnackbarContext, StoreContext } from '../context';
import { useStateCallback } from '../hooks';
import { Transaction } from '../models';
import { filterTransactions } from '../utils';

export const Transactions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { loading, filter, transactions, setTransactions } = React.useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = React.useState('');
  const [shownTransactions, setShownTransactions] =
    useStateCallback<readonly Transaction[]>(transactions);
  const [page, setPage] = React.useState(0);
  const [, startTransition] = React.useTransition();
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (transaction: Transaction) => {
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
        action: <Button onClick={() => handleDelete(transaction)}>Retry</Button>,
      });
    }
  };

  React.useEffect(() => setShownTransactions(transactions), [transactions, setShownTransactions]);

  React.useEffect(() => {
    setShownTransactions(filterTransactions(keyword, filter, transactions));
  }, [keyword, filter, transactions, setShownTransactions]);

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
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row' }}>
                <ShowFilterButton />
                <SearchInput onSearch={handleOnSearch} />
                <Tooltip title="Add Transaction">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loading ? (
            <CircularProgress />
          ) : transactions.length > 0 ? (
            <>
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
                              <Typography fontWeight="bolder">{`${format(
                                new Date(row.date),
                                'dd.MM.yy'
                              )}`}</Typography>
                            </TableCell>
                            <TableCell>
                              <CategoryChip category={row.categories} />
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.receiver}</Linkify>
                            </TableCell>
                            <TableCell>
                              <Typography>
                                {row.amount.toLocaleString('de', {
                                  style: 'currency',
                                  currency: 'EUR',
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <PaymentMethodChip paymentMethod={row.paymentMethods} />
                            </TableCell>
                            <TableCell>
                              <Linkify>{row.description ?? 'No information'}</Linkify>
                            </TableCell>
                            <TableCell align="right">
                              <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                <Tooltip title="Edit" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => setEditTransaction(row)}
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
                    count={shownTransactions.length}
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
            <NoResults sx={{ mt: 2 }} text="No transactions found" />
          )}
        </Card>
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
