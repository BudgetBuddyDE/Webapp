import React from 'react';
import {ActionPaper, Linkify} from '@/components/Base';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {useSnackbarContext} from '@/components/Snackbar';
import {CreateTransactionDrawer, EditTransactionDrawer, useFetchTransactions} from '@/components/Transaction';
import {Checkbox, Grid, IconButton, TableCell, TableRow, Typography} from '@mui/material';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {SearchInput} from '@/components/Base/Search';
import {AddRounded, DeleteRounded, EditRounded} from '@mui/icons-material';
import {Table} from '@/components/Base/Table';
import {AppConfig} from '@/app.config';
import {format} from 'date-fns';
import {DescriptionTableCellStyle} from '@/style/DescriptionTableCell.style';
import {ToggleFilterDrawerButton, useFilterStore} from '@/components/Filter';
import {filterTransactions} from '@/utils/filter.util';
import {CategoryChip} from '@/components/Category';
import {PaymentMethodChip} from '@/components/PaymentMethod';
import {type ISelectionHandler} from '@/components/Base/Select';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks';
import {PocketBaseCollection, TCreateTransactionPayload, type TTransaction} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';

interface ITransactionsHandler {
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  onEditTransaction: (transaction: TTransaction) => void;
  selection: ISelectionHandler<TTransaction>;
}

export const Transactions = () => {
  const {showSnackbar} = useSnackbarContext();
  const {filters} = useFilterStore();
  const {transactions, loading: loadingTransactions, refresh: refreshTransactions} = useFetchTransactions();
  const [showCreateDrawer, dispatchCreateDrawer] = React.useReducer(
    useEntityDrawer<TCreateTransactionPayload>,
    CreateEntityDrawerState<TCreateTransactionPayload>(),
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TTransaction>,
    CreateEntityDrawerState<TTransaction>(),
  );
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
      dispatchEditDrawer({type: 'open', payload: transaction});
    },
    async onConfirmTransactionDelete() {
      try {
        if (deleteTransactions.length === 0) return;

        const deleteResponses = Promise.allSettled(
          deleteTransactions.map(transaction => pb.collection(PocketBaseCollection.TRANSACTION).delete(transaction.id)),
        );
        console.debug('Deleting transactions', deleteResponses);

        setShowDeleteTransactionDialog(false);
        setDeleteTransactions([]);
        React.startTransition(() => {
          refreshTransactions();
        });
        showSnackbar({message: `Transactions we're deleted`});
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
          setSelectedTransactions(prev => prev.filter(({id}) => id !== entity.id));
        } else setSelectedTransactions(prev => [...prev, entity]);
      },
      isSelected(entity) {
        return selectedTransactions.find(elem => elem.id === entity.id) !== undefined;
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
          headerCells={['Processed at', 'Category', 'Receiver', 'Amount', 'Payment Method', 'Information', '']}
          renderRow={transaction => (
            <TableRow
              key={transaction.id}
              sx={{
                '&:last-child td, &:last-child th': {border: 0},
                whiteSpace: 'nowrap',
              }}>
              <TableCell size={AppConfig.table.cellSize}>
                <Checkbox
                  checked={handler.selection.isSelected(transaction)}
                  onChange={() => handler.selection.onSelect(transaction)}
                />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography fontWeight="bolder">{`${format(
                  new Date(transaction.processed_at),
                  'dd.MM.yy',
                )}`}</Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <CategoryChip category={transaction.expand.category} />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Linkify>{transaction.receiver}</Linkify>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography>
                  {transaction.transfer_amount.toLocaleString('de', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <PaymentMethodChip paymentMethod={transaction.expand.payment_method} />
              </TableCell>
              <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                <Linkify>{transaction.information ?? 'No information available'}</Linkify>
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <ActionPaper sx={{width: 'fit-content', ml: 'auto'}}>
                  <IconButton color="primary" onClick={() => handler.onEditTransaction(transaction)}>
                    <EditRounded />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handler.onTransactionDelete(transaction)}>
                    <DeleteRounded />
                  </IconButton>
                </ActionPaper>
              </TableCell>
            </TableRow>
          )}
          tableActions={
            <React.Fragment>
              <ToggleFilterDrawerButton />

              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => dispatchCreateDrawer({type: 'open'})}>
                <AddRounded fontSize="inherit" />
              </IconButton>
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

      <CreateTransactionDrawer {...showCreateDrawer} onClose={() => dispatchCreateDrawer({type: 'close'})} />

      <EditTransactionDrawer {...showEditDrawer} onClose={() => dispatchEditDrawer({type: 'close'})} />

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
        <AddFab onClick={() => dispatchCreateDrawer({type: 'open'})} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Transactions);
