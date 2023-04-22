import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  ActionPaper,
  Card,
  CategoryChip,
  CircularProgress,
  CreateFab,
  CreateSubscription,
  EarningsByCategory,
  EditSubscription,
  InitialTablePaginationState,
  Linkify,
  NoResults,
  PageHeader,
  PaymentMethodChip,
  SearchInput,
  SelectMultiple,
  ShowFilterButton,
  SubscriptionOverviewChart,
  TablePagination,
  TablePaginationHandler,
  UsedByPaymentMethod,
} from '../components';
import type { SelectMultipleHandler } from '../components';
import { SnackbarContext, StoreContext } from '../context';
import { useFetchCategories, useFetchPaymentMethods, useFetchSubscriptions, useFetchTransactions } from '../hooks';
import { Subscription } from '../models';
import { SelectMultipleReducer, TablePaginationReducer, generateInitialState } from '../reducer';
import { SubscriptionService } from '../services';
import { DescriptionTableCellStyle } from '../theme/description-table-cell.style';
import { determineNextExecution, filterSubscriptions } from '../utils';

interface SubscriptionsHandler {
  onSearch: (keyword: string) => void;
  pagination: TablePaginationHandler;
  subscription: {
    onDelete: (subscription: Subscription) => void;
    onEdit: (subscription: Subscription) => void;
    onShowAddForm: () => void;
  };
  selectMultiple: SelectMultipleHandler;
}

export const Subscriptions = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const { filter, setSubscriptions } = React.useContext(StoreContext);
  const fetchTransactions = useFetchTransactions();
  const fetchSubscriptions = useFetchSubscriptions();
  const fetchCategories = useFetchCategories();
  const fetchPaymentMethods = useFetchPaymentMethods();
  const [keyword, setKeyword] = React.useState('');
  const [, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editSubscription, setEditSubscription] = React.useState<Subscription | null>(null);
  const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);
  const [selectedSubscriptions, setSelectedSubscriptions] = React.useReducer(
    SelectMultipleReducer,
    generateInitialState()
  );

  const handler: SubscriptionsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    pagination: {
      onPageChange(newPage) {
        setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
      },
      onRowsPerPageChange(rowsPerPage) {
        setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
      },
    },
    subscription: {
      async onDelete(subscription) {
        try {
          const deletedSubscriptions = await subscription.delete();
          if (!deletedSubscriptions || deletedSubscriptions.length < 1) throw new Error('No subscription deleted');
          startTransition(() => {
            setSubscriptions({ type: 'REMOVE_BY_ID', id: deletedSubscriptions[0].id });
          });
          showSnackbar({ message: `Subscription ${subscription.receiver} deleted` });
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: `Could'nt delete transaction`,
            action: <Button onClick={() => handler.subscription.onDelete(subscription)}>Retry</Button>,
          });
        }
      },
      onShowAddForm() {
        setShowAddForm(true);
      },
      onEdit(subscription) {
        setEditSubscription(subscription);
      },
    },
    selectMultiple: {
      onSelectAll: (event, checked) => {
        startTransition(() => {
          setSelectedSubscriptions({
            type: 'SET_SELECTED',
            selected:
              selectedSubscriptions.selected.length > 0 &&
              (selectedSubscriptions.selected.length < shownSubscriptions.length ||
                shownSubscriptions.length === selectedSubscriptions.selected.length)
                ? []
                : fetchSubscriptions.subscriptions.map(({ id }) => id),
          });
        });
      },
      onSelectSingle: (event, checked) => {
        const item = Number(event.target.value);
        setSelectedSubscriptions(checked ? { type: 'ADD_ITEM', item: item } : { type: 'REMOVE_ITEM', item: item });
      },
      actionBar: {
        onEdit: () => {
          setSelectedSubscriptions({ type: 'OPEN_DIALOG', dialog: 'EDIT' });
        },
        onDelete: () => {
          setSelectedSubscriptions({ type: 'OPEN_DIALOG', dialog: 'DELETE' });
        },
      },
      dialog: {
        onEditConfirm: async (action, id) => {
          try {
            const result = await SubscriptionService.update(
              selectedSubscriptions.selected,
              action === 'CATEGORY' ? 'category' : 'paymentMethod',
              id
            );
            if (result.length === 0) return showSnackbar({ message: 'No subscriptions were updated' });
            await fetchSubscriptions.refresh();
            setSelectedSubscriptions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
            showSnackbar({ message: 'Subscriptions updated' });
          } catch (error) {
            console.error(error);
            showSnackbar({
              message: "Couln't update the subscriptions",
              // @ts-expect-error
              action: <Button onClick={() => handler.selectMultiple.dialog.onEditConfirm(action, id)}>Retry</Button>,
            });
            setSelectedSubscriptions({ type: 'CLOSE_DIALOG' });
          }
        },
        onEditCancel: () => {
          setSelectedSubscriptions({ type: 'CLOSE_DIALOG' });
        },
        onDeleteCancel: () => {
          setSelectedSubscriptions({ type: 'CLOSE_DIALOG' });
        },
        onDeleteConfirm: async () => {
          try {
            const result = await SubscriptionService.delete(selectedSubscriptions.selected);
            setSubscriptions({ type: 'REMOVE_MULTIPLE_BY_ID', ids: result.map((transaction) => transaction.id) });
            setSelectedSubscriptions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
            showSnackbar({ message: 'Transactions deleted' });
          } catch (error) {
            console.error(error);
            showSnackbar({
              message: "Couln't delete the transaction",
              action: <Button onClick={handler.selectMultiple.dialog.onDeleteConfirm}>Retry</Button>,
            });
            setSelectedSubscriptions({ type: 'CLOSE_DIALOG' });
          }
        },
      },
    },
  };

  const shownSubscriptions: Subscription[] = React.useMemo(() => {
    return filterSubscriptions(keyword, filter, fetchSubscriptions.subscriptions);
  }, [fetchSubscriptions.subscriptions, keyword, filter]);

  const currentPageSubscriptions: Subscription[] = React.useMemo(() => {
    const { page, rowsPerPage } = tablePagination;
    return shownSubscriptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [shownSubscriptions, tablePagination]);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Subscriptions" description="You got Disney+?" />

      <Grid item xs={12} md={12}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Subscriptions</Card.Title>
              <Card.Subtitle>Manage your monthly subscriptions</Card.Subtitle>
            </Box>
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
                <ShowFilterButton />
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Subscription">
                  <IconButton color="primary" onClick={() => handler.subscription.onShowAddForm()}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {fetchSubscriptions.loading ? (
            <CircularProgress />
          ) : shownSubscriptions.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <SelectMultiple.Actions
                  amount={selectedSubscriptions.selected.length}
                  onEdit={handler.selectMultiple.actionBar.onEdit}
                  onDelete={handler.selectMultiple.actionBar.onDelete}
                />
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Subscriptions Table">
                    <TableHead>
                      <TableRow>
                        <SelectMultiple.SelectAllCheckbox
                          onChange={handler.selectMultiple.onSelectAll}
                          indeterminate={
                            selectedSubscriptions.selected.length > 0 &&
                            selectedSubscriptions.selected.length < shownSubscriptions.length
                          }
                          checked={
                            selectedSubscriptions.selected.length === shownSubscriptions.length &&
                            selectedSubscriptions.selected.length > 0
                          }
                          withTableCell
                        />
                        {['Next execution', 'Category', 'Receiver', 'Amount', 'Payment Method', 'Information', ''].map(
                          (cell, index) => (
                            <TableCell key={index}>
                              <Typography fontWeight="bolder">{cell}</Typography>
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPageSubscriptions.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell>
                            <SelectMultiple.SelectSingleCheckbox
                              value={row.id}
                              onChange={handler.selectMultiple.onSelectSingle}
                              checked={selectedSubscriptions.selected.includes(row.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bolder">{determineNextExecution(row.execute_at)}</Typography>
                          </TableCell>
                          <TableCell>
                            <CategoryChip category={row.categories} />
                          </TableCell>
                          <TableCell>
                            <Linkify>{row.receiver}</Linkify>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {row.amount.toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <PaymentMethodChip paymentMethod={row.paymentMethods} />
                          </TableCell>
                          <TableCell sx={DescriptionTableCellStyle}>
                            <Linkify>{row.description || 'No Information'}</Linkify>
                          </TableCell>
                          <TableCell align="right">
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton color="primary" onClick={() => handler.subscription.onEdit(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton color="primary" onClick={() => handler.subscription.onDelete(row)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ActionPaper>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <TablePagination
                  {...tablePagination}
                  count={shownSubscriptions.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ m: 2 }} text="No subscriptions found" />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        <SubscriptionOverviewChart />
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!fetchCategories.loading && !fetchTransactions.loading && (
          <EarningsByCategory categories={fetchCategories.categories} transactions={fetchTransactions.transactions} />
        )}
      </Grid>

      <Grid item xs={12} md={4} lg={4} xl={4}>
        {!fetchPaymentMethods.loading && !fetchTransactions.loading && !fetchSubscriptions.loading && (
          <UsedByPaymentMethod
            paymentMethods={fetchPaymentMethods.paymentMethods}
            transactions={fetchTransactions.transactions}
            subscriptions={fetchSubscriptions.subscriptions}
          />
        )}
      </Grid>

      <CreateFab onClick={() => handler.subscription.onShowAddForm()} />
      <SelectMultiple.EditDialog
        open={selectedSubscriptions.dialog.show && selectedSubscriptions.dialog.type === 'EDIT'}
        onCancel={handler.selectMultiple.dialog.onEditCancel!}
        onUpdate={handler.selectMultiple.dialog.onEditConfirm!}
      />
      <SelectMultiple.ConfirmDeleteDialog
        open={selectedSubscriptions.dialog.show && selectedSubscriptions.dialog.type === 'DELETE'}
        onCancel={handler.selectMultiple.dialog.onDeleteCancel!}
        onConfirm={handler.selectMultiple.dialog.onDeleteConfirm!}
      />

      <CreateSubscription open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

      <EditSubscription
        open={editSubscription !== null}
        setOpen={(show) => {
          if (!show) setEditSubscription(null);
        }}
        subscription={editSubscription}
      />
    </Grid>
  );
};
