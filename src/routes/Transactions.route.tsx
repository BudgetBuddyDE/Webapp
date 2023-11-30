import React from 'react';
import { ActionPaper, Card, Linkify, NoResults } from '@/components/Base';
import { AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { useAuthContext } from '@/core/Auth';
import { withAuthLayout } from '@/core/Auth/Layout';
import { useSnackbarContext } from '@/core/Snackbar';
import {
  CreateTransactionDrawer,
  EditTransactionDrawer,
  TransactionService,
  useFetchTransactions,
} from '@/core/Transaction';
import {
  Box,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  InitialPaginationState,
  Pagination,
  PaginationHandler,
  PaginationReducer,
  usePagination,
} from '@/components/Base/Pagination';
import { TTransaction } from '@/types';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { SearchInput } from '@/components/Base/Search';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import { CircularProgress } from '@/components/Loading';
import { Table } from '@/components/Base/Table';
import { AppConfig } from '@/App.config';
import { format } from 'date-fns';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { ToggleFilterDrawerButton, useFilterStore } from '@/core/Filter';
import { filterTransactions } from '@/utils/filter.util';
import { CategoryChip } from '@/core/Category';
import { PaymentMethodChip } from '@/core/PaymentMethod';

interface ITransactionsHandler {
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  onEditTransaction: (transaction: TTransaction) => void;
  pagination: PaginationHandler;
}

export const Transactions = () => {
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const { filters } = useFilterStore();
  const {
    transactions,
    loading: loadingTransactions,
    refresh: refreshTransactions,
  } = useFetchTransactions();
  const [tablePagination, setTablePagination] = React.useReducer(
    PaginationReducer,
    InitialPaginationState
  );
  const [showCreateTransactionDrawer, setShowCreateTransactionDrawer] = React.useState(false);
  const [showEditTransactionDrawer, setShowEditTransactionDrawer] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<TTransaction | null>(null);
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = React.useState(false);
  const [deleteTransaction, setDeleteTransaction] = React.useState<TTransaction | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const displayedTransactions: TTransaction[] = React.useMemo(() => {
    return filterTransactions(keyword, filters, transactions);
  }, [transactions, keyword, filters, tablePagination]);
  const currentPageTransactions = usePagination(displayedTransactions, tablePagination);

  const handler: ITransactionsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onEditTransaction(transaction) {
      setShowEditTransactionDrawer(true);
      setEditTransaction(transaction);
    },
    async onConfirmTransactionDelete() {
      try {
        if (!deleteTransaction) return;
        const [deletedItem, error] = await TransactionService.delete(
          { transactionId: deleteTransaction.id },
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the transaction" });
        }

        setShowDeleteTransactionDialog(false);
        setDeleteTransaction(null);
        refreshTransactions(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Deleted the transaction` });
      } catch (error) {
        console.error(error);
      }
    },
    onTransactionDelete(transaction) {
      setShowDeleteTransactionDialog(true);
      setDeleteTransaction(transaction);
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

  return (
    <ContentGrid title={'Transactions'}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Transactions</Card.Title>
              <Card.Subtitle>Manage your transactions</Card.Subtitle>
            </Box>

            <Card.HeaderActions
              sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}
              actionPaperProps={{
                sx: { display: 'flex', flexDirection: 'row', width: { xs: '100%' } },
              }}
            >
              <ToggleFilterDrawerButton />
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => setShowCreateTransactionDrawer(true)}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </Card.HeaderActions>
          </Card.Header>
          {loadingTransactions && <CircularProgress />}
          {!loadingTransactions && currentPageTransactions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        'Processed at',
                        'Category',
                        'Receiver',
                        'Amount',
                        'Payment Method',
                        'Information',
                        '',
                      ].map((cell, index) => (
                        <TableCell key={index} size={AppConfig.table.cellSize}>
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
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography fontWeight="bolder">{`${format(
                            new Date(transaction.processedAt),
                            'dd.MM.yy'
                          )}`}</Typography>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <CategoryChip category={transaction.category} />
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <Linkify>{transaction.receiver}</Linkify>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography>
                            {transaction.transferAmount.toLocaleString('de', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <PaymentMethodChip paymentMethod={transaction.paymentMethod} />
                        </TableCell>
                        <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                          <Linkify>{transaction.description ?? 'No information'}</Linkify>
                        </TableCell>{' '}
                        <TableCell align="right" size={AppConfig.table.cellSize}>
                          <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onEditTransaction(transaction)}
                            >
                              <EditRounded />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onTransactionDelete(transaction)}
                            >
                              <DeleteRounded />
                            </IconButton>
                          </ActionPaper>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <Pagination
                  {...tablePagination}
                  count={displayedTransactions.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ m: 2 }} />
          )}
        </Card>
      </Grid>

      <CreateTransactionDrawer
        open={showCreateTransactionDrawer}
        onChangeOpen={(isOpen) => setShowCreateTransactionDrawer(isOpen)}
      />

      <EditTransactionDrawer
        open={showEditTransactionDrawer}
        onChangeOpen={(isOpen) => {
          setShowEditTransactionDrawer(isOpen);
          if (!isOpen) setEditTransaction(null);
        }}
        transaction={editTransaction}
      />

      <DeleteDialog
        open={showDeleteTransactionDialog}
        onClose={() => {
          setShowDeleteTransactionDialog(false);
          setDeleteTransaction(null);
        }}
        onCancel={() => {
          setShowDeleteTransactionDialog(false);
          setDeleteTransaction(null);
        }}
        onConfirm={handler.onConfirmTransactionDelete}
        withTransition
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={() => setShowCreateTransactionDrawer(true)} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Transactions);
