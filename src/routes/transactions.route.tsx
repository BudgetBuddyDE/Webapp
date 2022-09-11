import { useContext, useEffect, useState } from 'react';
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
import { SearchInput } from '../components/search-input.component';
import type { ITransaction } from '../types/transaction.interface';
import { CircularProgress } from '../components/progress.component';
import { format } from 'date-fns';
import { StoreContext } from '../context/store.context';
import { TransactionService } from '../services/transaction.service';
import { NoResults } from '../components/no-results.component';
import { CreateTransaction } from '../components/create-transaction.component';
import { EditTransaction } from '../components/edit-transaction.component';

export const Transactions = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const {
    loading,
    transactions,
    transactionReceiver,
    setTransactions,
    categories,
    paymentMethods,
  } = useContext(StoreContext);
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [keyword, setKeyword] = useState('');
  const [shownTransactions, setShownTransactions] = useState<readonly ITransaction[]>(transactions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<ITransaction | null>(null);

  const handleOnSearch = (text: string) => setKeyword(text.toLowerCase());

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    try {
      const data = await TransactionService.deleteTransactionById(id);
      if (data === null) throw new Error('No transaction deleted');
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
    if (transactions.length === 0) return;
    if (keyword === '') setShownTransactions(transactions);
    setShownTransactions(
      transactions.filter(
        (item) =>
          item.receiver.toLowerCase().includes(keyword) ||
          item.categories.name.toLowerCase().includes(keyword) ||
          item.paymentMethods.name.toLowerCase().includes(keyword) ||
          item.description?.toString().toLowerCase().includes(keyword)
      )
    );
  }, [keyword, transactions]);

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
