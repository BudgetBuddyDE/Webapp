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
import { Checkbox, Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
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
import { type ISelectionHandler } from '@/components/Base/Select';
import { HotkeyBadge } from '@/components/HotkeyBadge.component';

interface ITransactionsHandler {
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  onEditTransaction: (transaction: TTransaction) => void;
  selection: ISelectionHandler<TTransaction>;
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
  const [deleteTransactions, setDeleteTransactions] = React.useState<TTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<TTransaction[]>([]);
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
        if (deleteTransactions.length === 0) return;
        const [deletedItem, error] = await TransactionService.delete(
          deleteTransactions.map(({ id }) => ({ transactionId: id })),
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the transaction" });
        }

        setShowDeleteTransactionDialog(false);
        setDeleteTransactions([]);
        refreshTransactions(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Deleted the transaction` });
        setSelectedTransactions([]);
      } catch (error) {
        console.error(error);
      }
    },
    onTransactionDelete(transaction) {
      setShowDeleteTransactionDialog(true);
      setDeleteTransactions([transaction]);
    },
    selection: {
      onSelectAll(shouldSelectAll) {
        setSelectedTransactions(shouldSelectAll ? displayedTransactions : []);
      },
      onSelect(entity) {
        if (this.isSelected(entity)) {
          setSelectedTransactions((prev) => prev.filter(({ id }) => id !== entity.id));
        } else setSelectedTransactions((prev) => [...prev, entity]);
      },
      isSelected(entity) {
        return selectedTransactions.find((elem) => elem.id === entity.id) !== undefined;
      },
      onDeleteMultiple() {
        setShowDeleteTransactionDialog(true);
        setDeleteTransactions(selectedTransactions);
      },
    },
  };

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
              <TableCell>
                <Checkbox
                  checked={handler.selection.isSelected(transaction)}
                  onChange={() => handler.selection.onSelect(transaction)}
                />
              </TableCell>
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

              <HotkeyBadge hotkey="A">
                <IconButton color="primary" onClick={() => setShowCreateTransactionDrawer(true)}>
                  <AddRounded fontSize="inherit" />
                </IconButton>
              </HotkeyBadge>
            </React.Fragment>
          }
          withSelection
          onSelectAll={handler.selection.onSelectAll}
          amountOfSelectedEntities={selectedTransactions.length}
          onDelete={() => {
            if (handler.selection.onDeleteMultiple) handler.selection.onDeleteMultiple();
          }}
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
          setDeleteTransactions([]);
        }}
        onCancel={() => {
          setShowDeleteTransactionDialog(false);
          setDeleteTransactions([]);
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
