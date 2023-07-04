import React from 'react';
import { AppConfig } from '@/app.config';
import { Card } from '@/components/Base';
import { ActionPaper } from '@/components/Base/ActionPaper.component';
import { CategoryChip } from '@/components/Category/CategoryChip.component';
import { CircularProgress } from '@/components/Core/CircularProgress.component';
import { ShowFilterButton } from '@/components/Core/Drawer/FilterDrawer.component';
import { AddFab } from '@/components/Core/FAB/AddFab.component';
import { FabContainer } from '@/components/Core/FAB/FabContainer.component';
import { OpenFilterFab } from '@/components/Core/FAB/OpenFilterFab.component';
import { Linkify } from '@/components/Core/Linkify.component';
import { NoResults } from '@/components/Core/NoResults.component';
import {
    InitialTablePaginationState,
    TablePagination,
    TablePaginationHandler,
} from '@/components/Core/TablePagination.component';
import { SearchInput } from '@/components/Inputs/SearchInput.component';
import { PageHeader } from '@/components/Layout/PageHeader.component';
import { PaymentMethodChip } from '@/components/PaymentMethod/PaymentMethodChip.component';
import { SelectMultiple, SelectMultipleHandler } from '@/components/SelectMultiple';
import { CreateSubscriptionDrawer } from '@/components/Subscription/CreateSubscriptionDrawer.component';
import { EditSubscriptionDrawer } from '@/components/Subscription/EditSubscriptionDrawer.component';
import { SubscriptionOverviewChartCard } from '@/components/Subscription/SubscriptionOverviewChartCard.component';
import { CreateTransactionDrawer } from '@/components/Transaction/CreateTransactionDrawer.component';
import { SnackbarContext } from '@/context/Snackbar.context';
import { StoreContext } from '@/context/Store.context';
import { useFetchSubscriptions } from '@/hook/useFetchSubscriptions.hook';
import { Subscription } from '@/models/Subscription.model';
import { SelectMultipleReducer, generateInitialState } from '@/reducer/SelectMultuple.reducer';
import { TablePaginationReducer } from '@/reducer/TablePagination.reducer';
import { SubscriptionService } from '@/services/Subscription.service';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { TCreateTransactionProps } from '@/type/transaction.type';
import { filterSubscriptions } from '@/util/filter.util';
import {
    AddRounded as AddIcon,
    CompareArrowsRounded as CompareArrowsIcon,
    DeleteRounded as DeleteIcon,
    EditRounded as EditIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
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

interface SubscriptionsHandler {
    onSearch: (keyword: string) => void;
    pagination: TablePaginationHandler;
    subscription: {
        onDelete: (subscription: Subscription) => void;
        onEdit: (subscription: Subscription) => void;
        onShowAddForm: () => void;
    };
    transaction: {
        onShowCreateDrawer: (subscription: Subscription) => void;
        onHideCreateDrawer: () => void;
    };
    selectMultiple: SelectMultipleHandler;
}

const SubscriptionsRoute = () => {
    const { filter } = React.useContext(StoreContext);
    const { showSnackbar } = React.useContext(SnackbarContext);
    const {
        loading: loadingSubscriptions,
        subscriptions,
        refresh: refreshSubscriptions,
        fetched: areSubscriptionsFetched,
    } = useFetchSubscriptions();
    const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);
    const [selectedSubscriptions, setSelectedSubscriptions] = React.useReducer(
        SelectMultipleReducer,
        generateInitialState()
    );
    const [keyword, setKeyword] = React.useState('');
    const [showCreateTransactionForm, setShowCreateTransactionForm] = React.useState(false);
    const [createableTransaction, setCreateableTransaction] = React.useState<TCreateTransactionProps | null>(null);
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [showEditForm, setShowEditForm] = React.useState(false);
    const [editSubscription, setEditSubscription] = React.useState<Subscription | null>(null);

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
                    if (!deletedSubscriptions || deletedSubscriptions.length < 1)
                        throw new Error('No subscription deleted');

                    await refreshSubscriptions();
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
                setShowEditForm(true);
                setEditSubscription(subscription);
            },
        },
        transaction: {
            onShowCreateDrawer(subscription) {
                setShowCreateTransactionForm(true);
                setCreateableTransaction(subscription.getCreateTransactionsProps());
            },
            onHideCreateDrawer() {
                setShowCreateTransactionForm(false);
                setCreateableTransaction(null);
            },
        },
        selectMultiple: {
            onSelectAll: (_event, _checked) => {
                setSelectedSubscriptions({
                    type: 'SET_SELECTED',
                    selected:
                        selectedSubscriptions.selected.length > 0 &&
                        (selectedSubscriptions.selected.length < shownSubscriptions.length ||
                            shownSubscriptions.length === selectedSubscriptions.selected.length)
                            ? []
                            : subscriptions.map(({ id }) => id),
                });
            },
            onSelectSingle: (event, checked) => {
                const item = Number(event.target.value);
                setSelectedSubscriptions(
                    checked ? { type: 'ADD_ITEM', item: item } : { type: 'REMOVE_ITEM', item: item }
                );
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
                        await refreshSubscriptions();
                        setSelectedSubscriptions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
                        showSnackbar({ message: 'Subscriptions updated' });
                    } catch (error) {
                        console.error(error);
                        showSnackbar({
                            message: "Couln't update the subscriptions",
                            action: (
                                // @ts-expect-error
                                <Button onClick={() => handler.selectMultiple.dialog.onEditConfirm(action, id)}>
                                    Retry
                                </Button>
                            ),
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
                        if (selectedSubscriptions.selected.length == 0) throw new Error('No subscriptions selected');
                        const result = await SubscriptionService.delete(selectedSubscriptions.selected);
                        if (result.length != selectedSubscriptions.selected.length)
                            throw new Error("Couldn't delete all subscriptions");
                        await refreshSubscriptions();
                        setSelectedSubscriptions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
                        showSnackbar({ message: 'Subscriptions deleted' });
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
        return filterSubscriptions(keyword, filter, subscriptions);
    }, [subscriptions, keyword, filter]);

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
                                    <IconButton color="primary" onClick={handler.subscription.onShowAddForm}>
                                        <AddIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </ActionPaper>
                        </Card.HeaderActions>
                    </Card.Header>
                    {loadingSubscriptions && !areSubscriptionsFetched ? (
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
                                                        selectedSubscriptions.selected.length <
                                                            shownSubscriptions.length
                                                    }
                                                    checked={
                                                        selectedSubscriptions.selected.length ===
                                                            shownSubscriptions.length &&
                                                        selectedSubscriptions.selected.length > 0
                                                    }
                                                    withTableCell
                                                />
                                                {[
                                                    'Next execution',
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
                                                        <SelectMultiple.SelectSingleCheckbox
                                                            value={subscription.id}
                                                            onChange={handler.selectMultiple.onSelectSingle}
                                                            checked={selectedSubscriptions.selected.includes(
                                                                subscription.id
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Typography fontWeight="bolder">
                                                            {subscription.determineNextExecution()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <CategoryChip category={subscription.categories} />
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Linkify>{subscription.receiver}</Linkify>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Typography>
                                                            {subscription.amount.toLocaleString('de', {
                                                                style: 'currency',
                                                                currency: 'EUR',
                                                            })}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <PaymentMethodChip
                                                            paymentMethod={subscription.paymentMethods}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        sx={DescriptionTableCellStyle}
                                                        size={AppConfig.table.cellSize}
                                                    >
                                                        <Linkify>
                                                            {subscription.description || 'No Information'}
                                                        </Linkify>
                                                    </TableCell>
                                                    <TableCell align="right" size={AppConfig.table.cellSize}>
                                                        <Box display="flex" flexDirection="row">
                                                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                                                <Tooltip title="Edit" placement="top">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() =>
                                                                            handler.subscription.onEdit(subscription)
                                                                        }
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete" placement="top">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() =>
                                                                            handler.subscription.onDelete(subscription)
                                                                        }
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </ActionPaper>

                                                            <ActionPaper sx={{ width: 'max-content', ml: 1 }}>
                                                                <Tooltip title="Create transaction" placement="top">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() =>
                                                                            handler.transaction.onShowCreateDrawer(
                                                                                subscription
                                                                            )
                                                                        }
                                                                    >
                                                                        <CompareArrowsIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </ActionPaper>
                                                        </Box>
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
                        <NoResults sx={{ m: 2 }} text="No subscriptions found" withFilters />
                    )}
                </Card>
            </Grid>

            <Grid item xs={12} md={4} lg={4} xl={4}>
                {loadingSubscriptions ? (
                    <CircularProgress />
                ) : (
                    <SubscriptionOverviewChartCard subscriptions={subscriptions} />
                )}
            </Grid>

            <FabContainer>
                <OpenFilterFab />
                <AddFab onClick={() => handler.subscription.onShowAddForm()} />
            </FabContainer>

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

            <CreateTransactionDrawer
                open={showCreateTransactionForm}
                setOpen={(show) => {
                    if (!show) handler.transaction.onHideCreateDrawer();
                }}
                transaction={createableTransaction ?? undefined}
            />

            <CreateSubscriptionDrawer open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

            <EditSubscriptionDrawer
                open={showEditForm}
                setOpen={(show) => {
                    setShowEditForm(show);
                    if (!show) setEditSubscription(null);
                }}
                subscription={editSubscription}
            />
        </Grid>
    );
};

export default SubscriptionsRoute;
