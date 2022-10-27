import * as React from 'react';
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
  Chip,
  Button,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Card from '../components/card.component';
import { SnackbarContext } from '../context/snackbar.context';
import { PageHeader } from '../components/page-header.component';
import { SearchInput } from '../components/inputs/search-input.component';
import { CircularProgress } from '../components/progress.component';
import { format } from 'date-fns';
import { StoreContext } from '../context/store.context';
import { NoResults } from '../components/no-results.component';
import { CreateTransaction } from '../components/create-forms/create-transaction.component';
import { EditTransaction } from '../components/edit-forms/edit-transaction.component';
import { useStateCallback } from '../hooks/useStateCallback.hook';
import { filterTransactions } from '../utils/filter';
import { ShowFilterButton } from '../components/show-filter.component';
import { Transaction } from '../models/transaction.model';

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

  React.useEffect(() => setShownTransactions(transactions), [transactions]);

  React.useEffect(() => {
    setShownTransactions(filterTransactions(keyword, filter, transactions));
  }, [keyword, filter, transactions]);

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
              <ShowFilterButton />
              <SearchInput onSearch={handleOnSearch} />
              <Tooltip title="Add Transaction">
                <IconButton aria-label="add-transactions" onClick={() => setShowAddForm(true)}>
                  <AddIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
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
                                <IconButton onClick={() => setEditTransaction(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton onClick={() => handleDelete(row)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer>
                <TablePagination
                  component="div"
                  count={shownTransactions.length}
                  page={page}
                  onPageChange={handlePageChange}
                  labelRowsPerPage="Rows:"
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card.Footer>
            </>
          ) : (
            <NoResults sx={{ mt: 2 }} text="No transactions found" />
          )}
        </Card>
      </Grid>

      {/* Add Transaction */}
      <CreateTransaction open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      {/* Edit Transaction */}
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
