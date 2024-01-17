import React from 'react';
import { ActionPaper, Linkify } from '@/components/Base';
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
import { Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { TTransaction } from '@budgetbuddyde/types';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { SearchInput } from '@/components/Base/Search';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import { Table } from '@/components/Base/Table';
import { AppConfig } from '@/app.config';
import { format } from 'date-fns';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { useFilterStore } from '@/core/Filter';
import { filterTransactions } from '@/utils/filter.util';
import { CategoryChip } from '@/core/Category';
import { PaymentMethodChip } from '@/core/PaymentMethod';

interface ITransactionsHandler {
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  onEditTransaction: (transaction: TTransaction) => void;
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
  const [showCreateTransactionDrawer, setShowCreateTransactionDrawer] = React.useState(false);
  const [showEditTransactionDrawer, setShowEditTransactionDrawer] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<TTransaction | null>(null);
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = React.useState(false);
  const [deleteTransaction, setDeleteTransaction] = React.useState<TTransaction | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const displayedTransactions: TTransaction[] = React.useMemo(() => {
    return filterTransactions(keyword, filters, transactions);
  }, [transactions, keyword, filters]);

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
  };

  React.useEffect(() => console.log(displayedTransactions), [displayedTransactions]);

  return (
    <ContentGrid title={'Transactions'}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Table<TTransaction>
          isLoading={loadingTransactions}
          title="Transactions"
          subtitle="Manage your transactions"
          data={displayedTransactions}
          headerCells={[
            'Processed at',
            'Category',
            'Receiver',
            'Amount',
            'Payment Method',
            'Information',
            '',
          ]}
          renderHeaderCell={(headerCell) => (
            <TableCell
              key={headerCell.replaceAll(' ', '_').toLowerCase()}
              size={AppConfig.table.cellSize}
            >
              <Typography fontWeight="bolder">{headerCell}</Typography>
            </TableCell>
          )}
          renderRow={(transaction) => (
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
          )}
          tableActions={
            <React.Fragment>
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => setShowCreateTransactionDrawer(true)}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </React.Fragment>
          }
        />
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
