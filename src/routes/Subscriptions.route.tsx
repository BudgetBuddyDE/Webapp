import React from 'react';
import {ActionPaper, Linkify} from '@/components/Base';
import {SearchInput} from '@/components/Base/Search';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {
  SubscriptionActionMenu,
  useFetchSubscriptions,
  SubscriptionDrawer,
  type TSusbcriptionDrawerValues,
} from '@/components/Subscription';
import {AddRounded, DeleteRounded, EditRounded} from '@mui/icons-material';
import {Box, Checkbox, Grid, IconButton, TableCell, TableRow, Typography} from '@mui/material';
import {useSnackbarContext} from '@/components/Snackbar';
import {Table} from '@/components/Base/Table';
import {AppConfig} from '@/app.config';
import {DescriptionTableCellStyle} from '@/style/DescriptionTableCell.style';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {determineNextExecution, determineNextExecutionDate} from '@/utils';
import {filterSubscriptions} from '@/utils/filter.util';
import {ToggleFilterDrawerButton, useFilterStore} from '@/components/Filter';
import {CategoryChip} from '@/components/Category';
import {PaymentMethodChip} from '@/components/PaymentMethod';
import {type ISelectionHandler} from '@/components/Base/Select';
import {PocketBaseCollection, type TSubscription} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';
import {DownloadButton} from '@/components/Download';
import {format} from 'date-fns';
import {type TTransactionDrawerValues, TransactionDrawer} from '@/components/Transaction';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';

interface ISubscriptionsHandler {
  showCreateTransactionDialog: (subscription: TSubscription) => void;
  showCreateSubscriptionDialog: () => void;
  showEditSubscriptionDialog: (subscription: TSubscription) => void;
  onSearch: (keyword: string) => void;
  onSubscriptionDelete: (subscription: TSubscription) => void;
  onConfirmSubscriptionDelete: () => void;
  onToggleExecutionStatus: (subscription: TSubscription) => void;
  selection: ISelectionHandler<TSubscription>;
}

export const Subscriptions = () => {
  const {showSnackbar} = useSnackbarContext();
  const {filters} = useFilterStore();
  const {subscriptions, loading: loadingSubscriptions, refresh: refreshSubscriptions} = useFetchSubscriptions();
  const [transactionDrawer, dispatchTransactionDrawer] = React.useReducer(
    useEntityDrawer<TTransactionDrawerValues>,
    UseEntityDrawerDefaultState<TTransactionDrawerValues>(),
  );
  const [subscriptionDrawer, dispatchSubscriptionDrawer] = React.useReducer(
    useEntityDrawer<TSusbcriptionDrawerValues>,
    UseEntityDrawerDefaultState<TSusbcriptionDrawerValues>(),
  );
  const [showDeleteSubscriptionDialog, setShowDeleteSubscriptionDialog] = React.useState(false);
  const [deleteSubscriptions, setDeleteSubscriptions] = React.useState<TSubscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = React.useState<TSubscription[]>([]);
  const [keyword, setKeyword] = React.useState('');

  const displayedSubscriptions: TSubscription[] = React.useMemo(() => {
    return filterSubscriptions(keyword, filters, subscriptions);
  }, [subscriptions, keyword, filters]);

  const handler: ISubscriptionsHandler = {
    showCreateTransactionDialog(subscription) {
      const {
        execute_at,
        transfer_amount,
        information,
        expand: {category, payment_method},
      } = subscription;
      dispatchTransactionDrawer({
        type: 'OPEN',
        drawerAction: 'CREATE',
        payload: {
          processed_at: determineNextExecutionDate(execute_at),
          category: {label: category.name, id: category.id},
          payment_method: {label: payment_method.name, id: payment_method.id},
          receiver: {label: subscription.receiver, value: subscription.receiver},
          transfer_amount: transfer_amount,
          information,
        },
      });
    },
    showCreateSubscriptionDialog() {
      dispatchSubscriptionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    showEditSubscriptionDialog(subscription) {
      const {
        id,
        execute_at,
        receiver,
        transfer_amount,
        information,
        paused,
        expand: {category, payment_method},
      } = subscription;
      dispatchSubscriptionDrawer({
        type: 'OPEN',
        drawerAction: 'UPDATE',
        payload: {
          id,
          execute_at: determineNextExecutionDate(execute_at),
          receiver: {label: receiver, value: receiver},
          transfer_amount,
          information,
          category: {label: category.name, id: category.id},
          payment_method: {label: payment_method.name, id: payment_method.id},
          paused,
        },
      });
    },
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    async onConfirmSubscriptionDelete() {
      try {
        if (deleteSubscriptions.length === 0) return;

        const deleteResponses = Promise.allSettled(
          deleteSubscriptions.map(subscription =>
            pb.collection(PocketBaseCollection.SUBSCRIPTION).delete(subscription.id),
          ),
        );
        console.debug('Deleting subscriptions', deleteResponses);

        setShowDeleteSubscriptionDialog(false);
        setDeleteSubscriptions([]);
        React.startTransition(() => {
          refreshSubscriptions();
        });
        showSnackbar({message: `Subscriptions we're deleted`});
        setSelectedSubscriptions([]);
      } catch (error) {
        console.error(error);
      }
    },
    onSubscriptionDelete(subscription) {
      setShowDeleteSubscriptionDialog(true);
      setDeleteSubscriptions([subscription]);
    },
    async onToggleExecutionStatus(subscription) {
      try {
        const record = await pb.collection(PocketBaseCollection.SUBSCRIPTION).update(subscription.id, {
          paused: !subscription.paused,
        });

        console.debug('Updated subscription', record);

        showSnackbar({message: `Subscription #${subscription.id} ${record.paused ? 'paused' : 'resumed'}`});
        React.startTransition(() => {
          refreshSubscriptions();
        });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: error instanceof Error ? error.message : "Something wen't wrong",
        });
      }
    },
    selection: {
      onSelectAll(shouldSelectAll) {
        setSelectedSubscriptions(shouldSelectAll ? displayedSubscriptions : []);
      },
      onSelect(entity) {
        if (this.isSelected(entity)) {
          setSelectedSubscriptions(prev => prev.filter(({id}) => id !== entity.id));
        } else setSelectedSubscriptions(prev => [...prev, entity]);
      },
      isSelected(entity) {
        return selectedSubscriptions.find(elem => elem.id === entity.id) !== undefined;
      },
      onDeleteMultiple() {
        setShowDeleteSubscriptionDialog(true);
        setDeleteSubscriptions(selectedSubscriptions);
      },
    },
  };

  return (
    <ContentGrid title={'Subscriptions'}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Table<TSubscription>
          isLoading={loadingSubscriptions}
          title="Subscriptions"
          subtitle="Manage your subscriptions"
          data={displayedSubscriptions}
          headerCells={['Execute at', 'Category', 'Receiver', 'Amount', 'Payment Method', 'Information', '']}
          renderRow={subscription => (
            <TableRow
              key={subscription.id}
              sx={{
                '&:last-child td, &:last-child th': {border: 0},
                whiteSpace: 'nowrap',
              }}>
              <TableCell>
                <Checkbox
                  checked={handler.selection.isSelected(subscription)}
                  onChange={() => handler.selection.onSelect(subscription)}
                />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography
                  fontWeight="bolder"
                  sx={{
                    textDecoration: subscription.paused ? 'line-through' : 'unset',
                  }}>
                  {determineNextExecution(subscription.execute_at)}
                </Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <CategoryChip category={subscription.expand.category} />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Linkify>{subscription.receiver}</Linkify>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography>
                  {subscription.transfer_amount.toLocaleString('de', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <PaymentMethodChip paymentMethod={subscription.expand.payment_method} />
              </TableCell>
              <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                <Linkify>{subscription.information ?? 'No information available'}</Linkify>
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                  <ActionPaper sx={{width: 'fit-content', ml: 'auto'}}>
                    <IconButton color="primary" onClick={() => handler.showEditSubscriptionDialog(subscription)}>
                      <EditRounded />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handler.onSubscriptionDelete(subscription)}>
                      <DeleteRounded />
                    </IconButton>
                  </ActionPaper>

                  <ActionPaper sx={{width: 'max-content', ml: 1}}>
                    <SubscriptionActionMenu
                      subscription={subscription}
                      onCreateTransaction={handler.showCreateTransactionDialog}
                      onToggleExecutionState={handler.onToggleExecutionStatus}
                    />
                  </ActionPaper>
                </Box>
              </TableCell>
            </TableRow>
          )}
          tableActions={
            <React.Fragment>
              <ToggleFilterDrawerButton />

              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={handler.showCreateSubscriptionDialog}>
                <AddRounded fontSize="inherit" />
              </IconButton>
              {subscriptions.length > 0 && (
                <DownloadButton
                  data={subscriptions}
                  exportFileName={`bb_subscriptions_${format(new Date(), 'yyyy_mm_dd')}`}
                  exportFormat="JSON"
                  withTooltip>
                  Export
                </DownloadButton>
              )}
            </React.Fragment>
          }
          withSelection
          onSelectAll={handler.selection.onSelectAll}
          amountOfSelectedEntities={selectedSubscriptions.length}
          onDelete={() => {
            if (handler.selection.onDeleteMultiple) handler.selection.onDeleteMultiple();
          }}
        />
      </Grid>

      <DeleteDialog
        open={showDeleteSubscriptionDialog}
        onClose={() => {
          setShowDeleteSubscriptionDialog(false);
          setDeleteSubscriptions([]);
        }}
        onCancel={() => {
          setShowDeleteSubscriptionDialog(false);
          setDeleteSubscriptions([]);
        }}
        onConfirm={handler.onConfirmSubscriptionDelete}
        withTransition
      />

      <TransactionDrawer
        {...transactionDrawer}
        onClose={() => dispatchTransactionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <SubscriptionDrawer
        {...subscriptionDrawer}
        onClose={() => dispatchSubscriptionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={handler.showCreateSubscriptionDialog} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Subscriptions);
