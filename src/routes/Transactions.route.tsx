import {type TTransaction} from '@budgetbuddyde/types';
import {AddRounded, DeleteRounded, EditRounded} from '@mui/icons-material';
import {Avatar, AvatarGroup, Checkbox, Grid, IconButton, TableCell, TableRow, Typography} from '@mui/material';
import {format} from 'date-fns';
import React from 'react';

import {AppConfig} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {withAuthLayout} from '@/components/Auth/Layout';
import {ActionPaper, Linkify} from '@/components/Base';
import {SearchInput} from '@/components/Base/Search';
import {type ISelectionHandler} from '@/components/Base/Select';
import {Table} from '@/components/Base/Table';
import {CategoryChip} from '@/components/Category';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {DownloadButton} from '@/components/Download';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {ToggleFilterDrawerButton, useFilterStore} from '@/components/Filter';
import {ImageViewDialog} from '@/components/ImageViewDialog.component';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {PaymentMethodChip} from '@/components/PaymentMethod';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  type TTransactionDrawerValues,
  TransactionDrawer,
  TransactionService,
  useFetchTransactions,
} from '@/components/Transaction';
import {pb} from '@/pocketbase';
import {DescriptionTableCellStyle} from '@/style/DescriptionTableCell.style';
import {filterTransactions} from '@/utils/filter.util';

interface ITransactionsHandler {
  showCreateDialog: () => void;
  showEditDialog: (transaction: TTransaction) => void;
  onSearch: (keyword: string) => void;
  onTransactionDelete: (transaction: TTransaction) => void;
  onConfirmTransactionDelete: () => void;
  selection: ISelectionHandler<TTransaction>;
}

export const Transactions = () => {
  const {fileToken} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {filters} = useFilterStore();
  const {transactions, loading: loadingTransactions, refresh: refreshTransactions} = useFetchTransactions();
  const [transactionDrawer, dispatchTransactionDrawer] = React.useReducer(
    useEntityDrawer<TTransactionDrawerValues>,
    UseEntityDrawerDefaultState<TTransactionDrawerValues>(),
  );
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = React.useState(false);
  const [deleteTransactions, setDeleteTransactions] = React.useState<TTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<TTransaction[]>([]);
  const [keyword, setKeyword] = React.useState('');
  const displayedTransactions: TTransaction[] = React.useMemo(() => {
    return filterTransactions(keyword, filters, transactions);
  }, [transactions, keyword, filters]);
  const [imageDialog, setImageDialog] = React.useState<{
    open: boolean;
    fileName: string | null;
    fileUrl: string | null;
  }>({open: false, fileName: null, fileUrl: null});

  const handler: ITransactionsHandler = {
    showCreateDialog() {
      dispatchTransactionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
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
          headerCells={['Processed at', 'Category', 'Receiver', 'Amount', 'Payment Method', 'Information', 'Files', '']}
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
              <TableCell size={AppConfig.table.cellSize}>
                <AvatarGroup max={4} variant="rounded">
                  {transaction.attachments?.map(fileName => (
                    <Avatar
                      key={fileName}
                      variant="rounded"
                      alt={fileName}
                      src={pb.files.getUrl(transaction, fileName, {token: fileToken})}
                      sx={{
                        ':hover': {
                          zIndex: 1,
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s ease-in-out',
                        },
                      }}
                      onClick={() =>
                        setImageDialog({
                          open: true,
                          fileName: fileName,
                          fileUrl: pb.files.getUrl(transaction, fileName, {token: fileToken}),
                        })
                      }
                    />
                  ))}
                </AvatarGroup>
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <ActionPaper sx={{width: 'fit-content', ml: 'auto'}}>
                  <IconButton color="primary" onClick={() => handler.showEditDialog(transaction)}>
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

              <IconButton color="primary" onClick={handler.showCreateDialog}>
                <AddRounded fontSize="inherit" />
              </IconButton>
              {transactions.length > 0 && (
                <DownloadButton
                  data={transactions}
                  exportFileName={`bb_transactions_${format(new Date(), 'yyyy_mm_dd')}`}
                  exportFormat="JSON"
                  withTooltip>
                  Export
                </DownloadButton>
              )}
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

      <TransactionDrawer
        {...transactionDrawer}
        onClose={() => dispatchTransactionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
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
