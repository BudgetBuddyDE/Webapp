import {type TTransaction} from '@budgetbuddyde/types';
import {Grid} from '@mui/material';
import React from 'react';

import {withAuthLayout} from '@/components/Auth/Layout';
import {type ISelectionHandler} from '@/components/Base/Select';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {ImageViewDialog} from '@/components/ImageViewDialog.component';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  CreateMultipleTransactionsDialog,
  type TTransactionDrawerValues,
  TransactionDrawer,
  TransactionService,
  TransactionTable,
  useFetchTransactions,
} from '@/components/Transaction';
import {FilterService} from '@/services';

interface ITransactionsHandler {
  showCreateDialog: () => void;
  showEditDialog: (transaction: TTransaction) => void;
  showCreateMultipleDialog: (showDialog: boolean) => void;
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  selection: ISelectionHandler<TTransaction>;
}

export const Transactions = () => {
  const {showSnackbar} = useSnackbarContext();
  const {transactions, refresh: refreshTransactions} = useFetchTransactions();
  const [transactionDrawer, dispatchTransactionDrawer] = React.useReducer(
    useEntityDrawer<TTransactionDrawerValues>,
    UseEntityDrawerDefaultState<TTransactionDrawerValues>(),
  );
  const [showCreateMultipleDialog, setShowCreateMultipleDialog] = React.useState(false);
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = React.useState(false);
  const [deleteTransactions, setDeleteTransactions] = React.useState<TTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<TTransaction[]>([]);
  const [keyword, setKeyword] = React.useState('');
  const displayedTransactions: TTransaction[] = React.useMemo(() => {
    return FilterService.locallyFilterByKeyword(transactions, ['receiver', 'information'], keyword);
  }, [transactions, keyword]);
  const [imageDialog, setImageDialog] = React.useState<{
    open: boolean;
    fileName: string | null;
    fileUrl: string | null;
  }>({open: false, fileName: null, fileUrl: null});

  const handler: ITransactionsHandler = {
    showCreateDialog() {
      dispatchTransactionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    showCreateMultipleDialog(showDialog) {
      setShowCreateMultipleDialog(showDialog);
    },
    showEditDialog({id, processed_at, receiver, transfer_amount, information, expand: {category, payment_method}}) {
      dispatchTransactionDrawer({
        type: 'OPEN',
        drawerAction: 'UPDATE',
        payload: {
          id,
          processed_at,
          receiver: {value: receiver, label: receiver},
          transfer_amount,
          information: information ?? '',
          category: {label: category.name, id: category.id},
          payment_method: {label: payment_method.name, id: payment_method.id},
        },
      });
    },
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    async onConfirmTransactionDelete() {
      try {
        if (deleteTransactions.length === 0) return;

        const deleteResponses = Promise.allSettled(
          deleteTransactions.map(({id}) => TransactionService.deleteTransaction(id)),
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
        if (handler.selection.isSelected(entity)) {
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
        <TransactionTable
          onAddTransaction={handler.showCreateDialog}
          onAddMultiple={() => handler.showCreateMultipleDialog(true)}
          onEditTransaction={handler.showEditDialog}
          onDeleteTransaction={handler.onTransactionDelete}
          onOpenImage={(fileName, fileUrl) => setImageDialog({open: true, fileName, fileUrl})}
          amountOfSelectedEntities={selectedTransactions.length}
          isSelected={handler.selection.isSelected}
          onSelectAll={handler.selection.onSelectAll}
          onSelect={handler.selection.onSelect}
          onDelete={handler.selection.onDeleteMultiple}
        />
      </Grid>

      <TransactionDrawer
        {...transactionDrawer}
        onClose={() => dispatchTransactionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <CreateMultipleTransactionsDialog
        open={showCreateMultipleDialog}
        onClose={() => handler.showCreateMultipleDialog(false)}
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

      <ImageViewDialog
        dialogProps={{
          open: imageDialog.open,
          onClose: () => setImageDialog({open: false, fileName: null, fileUrl: null}),
        }}
        fileName={imageDialog.fileName ?? ''}
        fileUrl={imageDialog.fileUrl ?? ''}
        withTransition
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={handler.showCreateDialog} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Transactions);
