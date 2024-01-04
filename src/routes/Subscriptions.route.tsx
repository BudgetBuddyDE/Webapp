import React from 'react';
import { ActionPaper, Card, Linkify, NoResults } from '@/components/Base';
import { SearchInput } from '@/components/Base/Search';
import { AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { CircularProgress } from '@/components/Loading';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  CreateSubscriptionDrawer,
  EditSubscriptionDrawer,
  SubscriptionActionMenu,
  SubscriptionService,
  useFetchSubscriptions,
} from '@/core/Subscription';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
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
import { useSnackbarContext } from '@/core/Snackbar';
import { useAuthContext } from '@/core/Auth';
import {
  InitialPaginationState,
  type PaginationHandler,
  PaginationReducer,
  usePagination,
  Pagination,
} from '@/components/Base/Pagination';
import { TSubscription, TTransaction, TUpdateSubscriptionPayload } from '@budgetbuddyde/types';
import { Table } from '@/components/Base/Table';
import { AppConfig } from '@/app.config';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { determineNextExecution, determineNextExecutionDate } from '@/utils';
import { CreateTransactionDrawer } from '@/core/Transaction';
import { filterSubscriptions } from '@/utils/filter.util';
import { ToggleFilterDrawerButton, useFilterStore } from '@/core/Filter';
import { CategoryChip } from '@/core/Category';
import { PaymentMethodChip } from '@/core/PaymentMethod';

interface ISubscriptionsHandler {
  onSearch: (keyword: string) => void;
  onSubscriptionDelete: (subscription: TSubscription) => void;
  onConfirmSubscriptionDelete: () => void;
  onEditSubscription: (subscription: TSubscription) => void;
  onToggleExecutionStatus: (subscription: TSubscription) => void;
  transaction: {
    onShowCreateDrawer: (subscription: TSubscription) => void;
    onHideCreateDrawer: () => void;
  };
  pagination: PaginationHandler;
}

export const Subscriptions = () => {
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const { filters } = useFilterStore();
  const {
    subscriptions,
    loading: loadingSubscriptions,
    refresh: refreshSubscriptions,
  } = useFetchSubscriptions();
  const [tablePagination, setTablePagination] = React.useReducer(
    PaginationReducer,
    InitialPaginationState
  );
  const [showCreateSubscriptionsDrawer, setShowCreateSubscriptionDrawer] = React.useState(false);
  const [showEditSubscriptionDrawer, setShowEditSubscriptionDrawer] = React.useState(false);
  const [editSubscription, setEditSubscription] = React.useState<TSubscription | null>(null);
  const [showDeleteSubscriptionDialog, setShowDeleteSubscriptionDialog] = React.useState(false);
  const [deleteSubscription, setDeleteSubscription] = React.useState<TSubscription | null>(null);
  const [showCreateTransactionDrawer, setShowCreateTransactionDrawer] = React.useState(false);
  const [createableTransaction, setCreateableTransaction] = React.useState<TTransaction | null>(
    null
  );
  const [keyword, setKeyword] = React.useState('');
  const displayedSubscriptions: TSubscription[] = React.useMemo(() => {
    return filterSubscriptions(keyword, filters, subscriptions);
  }, [subscriptions, keyword, filters, tablePagination]);
  const currentPageSubscriptions = usePagination(displayedSubscriptions, tablePagination);

  const handler: ISubscriptionsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onEditSubscription(subscription) {
      setShowEditSubscriptionDrawer(true);
      setEditSubscription(subscription);
    },
    async onConfirmSubscriptionDelete() {
      try {
        console.log(deleteSubscription);
        if (!deleteSubscription) return;
        const [deletedItem, error] = await SubscriptionService.delete(
          { subscriptionId: deleteSubscription.id },
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the subscription" });
        }

        setShowDeleteSubscriptionDialog(false);
        setDeleteSubscription(null);
        refreshSubscriptions(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Subscription deleted` });
      } catch (error) {
        console.error(error);
      }
    },
    onSubscriptionDelete(subscription) {
      setShowDeleteSubscriptionDialog(true);
      setDeleteSubscription(subscription);
    },
    async onToggleExecutionStatus(subscription) {
      try {
        const payload: TUpdateSubscriptionPayload = {
          ...SubscriptionService.getUpdateValues(subscription),
          paused: !subscription.paused,
        };
        const [updatedSubscription, error] = await SubscriptionService.update(payload, authOptions);
        if (error) throw error;
        if (!updatedSubscription) {
          throw new Error("No changes we're saved");
        }
        refreshSubscriptions();
        showSnackbar({
          message: `Subscription is now ${updatedSubscription.paused ? 'paused' : 'active'}`,
        });
      } catch (error) {
        console.error(error);
        showSnackbar({
          message: error instanceof Error ? error.message : "Something wen't wrong",
        });
      }
    },
    transaction: {
      onShowCreateDrawer({
        owner,
        category,
        description,
        executeAt,
        paymentMethod,
        receiver,
        transferAmount,
      }) {
        setShowCreateTransactionDrawer(true);
        setCreateableTransaction({
          id: -1,
          category: category,
          paymentMethod: paymentMethod,
          receiver: receiver,
          description: description,
          transferAmount: transferAmount,
          owner: owner,
          processedAt: determineNextExecutionDate(executeAt),
          createdAt: new Date(),
        });
      },
      onHideCreateDrawer() {
        setShowCreateTransactionDrawer(false);
        setCreateableTransaction(null);
      },
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
    <ContentGrid title={'Subscriptions'}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your subscriptions</Card.Subtitle>
            </Box>

            <Card.HeaderActions
              sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}
              actionPaperProps={{
                sx: { display: 'flex', flexDirection: 'row', width: { xs: '100%' } },
              }}
            >
              <ToggleFilterDrawerButton />
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => setShowCreateSubscriptionDrawer(true)}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </Card.HeaderActions>
          </Card.Header>
          {loadingSubscriptions && <CircularProgress />}
          {!loadingSubscriptions && currentPageSubscriptions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        'Execute at',
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
                    {currentPageSubscriptions.map((subscription) => (
                      <TableRow
                        key={subscription.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography
                            fontWeight="bolder"
                            sx={{
                              textDecoration: subscription.paused ? 'line-through' : 'unset',
                            }}
                          >
                            {determineNextExecution(subscription.executeAt)}
                          </Typography>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <CategoryChip category={subscription.category} />
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <Linkify>{subscription.receiver}</Linkify>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography>
                            {subscription.transferAmount.toLocaleString('de', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <PaymentMethodChip paymentMethod={subscription.paymentMethod} />
                        </TableCell>
                        <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                          <Linkify>{subscription.description ?? 'No information'}</Linkify>
                        </TableCell>{' '}
                        <TableCell align="right" size={AppConfig.table.cellSize}>
                          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <IconButton
                                color="primary"
                                onClick={() => handler.onEditSubscription(subscription)}
                              >
                                <EditRounded />
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handler.onSubscriptionDelete(subscription)}
                              >
                                <DeleteRounded />
                              </IconButton>
                            </ActionPaper>

                            <ActionPaper sx={{ width: 'max-content', ml: 1 }}>
                              <SubscriptionActionMenu
                                subscription={subscription}
                                onCreateTransaction={handler.transaction.onShowCreateDrawer}
                                onToggleExecutionState={handler.onToggleExecutionStatus}
                              />
                            </ActionPaper>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <Pagination
                  {...tablePagination}
                  count={displayedSubscriptions.length}
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
        onChangeOpen={(isOpen) => {
          setShowCreateTransactionDrawer(isOpen);
          if (!isOpen) setCreateableTransaction(null);
        }}
        transaction={createableTransaction}
      />

      <CreateSubscriptionDrawer
        open={showCreateSubscriptionsDrawer}
        onChangeOpen={(isOpen) => setShowCreateSubscriptionDrawer(isOpen)}
      />

      <EditSubscriptionDrawer
        open={showEditSubscriptionDrawer}
        onChangeOpen={(isOpen) => {
          setShowEditSubscriptionDrawer(isOpen);
          if (!isOpen) setEditSubscription(null);
        }}
        subscription={editSubscription}
      />

      <DeleteDialog
        open={showDeleteSubscriptionDialog}
        onClose={() => {
          setShowDeleteSubscriptionDialog(false);
          setDeleteSubscription(null);
        }}
        onCancel={() => {
          setShowDeleteSubscriptionDialog(false);
          setDeleteSubscription(null);
        }}
        onConfirm={handler.onConfirmSubscriptionDelete}
        withTransition
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={() => setShowCreateSubscriptionDrawer(true)} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Subscriptions);
