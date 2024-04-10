import React from 'react';
import {ActionPaper, Linkify} from '@/components/Base';
import {SearchInput} from '@/components/Base/Search';
import {AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {
  CreateSubscriptionDrawer,
  EditSubscriptionDrawer,
  SubscriptionActionMenu,
  useFetchSubscriptions,
} from '@/components/Subscription';
import {AddRounded, DeleteRounded, EditRounded} from '@mui/icons-material';
import {Box, Checkbox, Grid, IconButton, TableCell, TableRow, Typography} from '@mui/material';
import {useSnackbarContext} from '@/components/Snackbar';
import {Table} from '@/components/Base/Table';
import {AppConfig} from '@/app.config';
import {DescriptionTableCellStyle} from '@/style/DescriptionTableCell.style';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {determineNextExecution, determineNextExecutionDate} from '@/utils';
import {CreateTransactionDrawer} from '@/components/Transaction';
import {filterSubscriptions} from '@/utils/filter.util';
import {ToggleFilterDrawerButton, useFilterStore} from '@/components/Filter';
import {CategoryChip} from '@/components/Category';
import {PaymentMethodChip} from '@/components/PaymentMethod';
import {type ISelectionHandler} from '@/components/Base/Select';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks';
import {
  PocketBaseCollection,
  type TCreateSubscriptionPayload,
  type TCreateTransactionPayload,
  type TSubscription,
} from '@budgetbuddyde/types';
import {pb} from '@/pocketbase';
import {DownloadButton} from '@/components/Download';
import {format} from 'date-fns';

interface ISubscriptionsHandler {
  onSearch: (keyword: string) => void;
  onSubscriptionDelete: (subscription: TSubscription) => void;
  onConfirmSubscriptionDelete: () => void;
  onEditSubscription: (subscription: TSubscription) => void;
  onToggleExecutionStatus: (subscription: TSubscription) => void;
  transaction: {
    onShowCreateDrawer: (subscription: TSubscription) => void;
  };
  selection: ISelectionHandler<TSubscription>;
}

export const Subscriptions = () => {
  const {showSnackbar} = useSnackbarContext();
  const {filters} = useFilterStore();
  const {subscriptions, loading: loadingSubscriptions, refresh: refreshSubscriptions} = useFetchSubscriptions();
  const [showCreateTransactionDrawer, dispatchCreateTransactionDrawer] = React.useReducer(
    useEntityDrawer<TCreateTransactionPayload>,
    CreateEntityDrawerState<TCreateTransactionPayload>(),
  );
  const [showCreateDrawer, dispatchCreateDrawer] = React.useReducer(
    useEntityDrawer<TCreateSubscriptionPayload>,
    CreateEntityDrawerState<TCreateSubscriptionPayload>(),
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TSubscription>,
    CreateEntityDrawerState<TSubscription>(),
  );
  const [showDeleteSubscriptionDialog, setShowDeleteSubscriptionDialog] = React.useState(false);
  const [deleteSubscriptions, setDeleteSubscriptions] = React.useState<TSubscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = React.useState<TSubscription[]>([]);
  const [keyword, setKeyword] = React.useState('');

  const displayedSubscriptions: TSubscription[] = React.useMemo(() => {
    return filterSubscriptions(keyword, filters, subscriptions);
  }, [subscriptions, keyword, filters]);

  const handler: ISubscriptionsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onEditSubscription(subscription) {
      dispatchEditDrawer({type: 'open', payload: subscription});
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
    transaction: {
      onShowCreateDrawer(data) {
        dispatchCreateTransactionDrawer({
          type: 'open',
          payload: {
            ...data,
            processed_at: determineNextExecutionDate(data.execute_at),
            transfer_amount: data.transfer_amount,
          },
        });
      },
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
                    <IconButton
                      color="primary"
                      onClick={() => {
                        handler.onEditSubscription(subscription);
                      }}>
                      <EditRounded />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handler.onSubscriptionDelete(subscription)}>
                      <DeleteRounded />
                    </IconButton>
                  </ActionPaper>

                  <ActionPaper sx={{width: 'max-content', ml: 1}}>
                    <SubscriptionActionMenu
                      subscription={subscription}
                      onCreateTransaction={handler.transaction.onShowCreateDrawer}
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

              <IconButton color="primary" onClick={() => dispatchCreateDrawer({type: 'open'})}>
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

      <CreateTransactionDrawer
        {...showCreateTransactionDrawer}
        onClose={() => dispatchCreateTransactionDrawer({type: 'close'})}
      />

      <CreateSubscriptionDrawer {...showCreateDrawer} onClose={() => dispatchCreateDrawer({type: 'close'})} />

      <EditSubscriptionDrawer {...showEditDrawer} onClose={() => dispatchEditDrawer({type: 'close'})} />

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

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={() => dispatchCreateDrawer({type: 'open'})} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Subscriptions);
