import { format } from 'date-fns';
import React from 'react';
import { AppConfig } from '@/app.config';
import {
    ActionPaper,
    Card,
    CategoryChip,
    CircularProgress,
    CreateFab,
    CreateTransaction,
    EarningsByCategory,
    EditTransaction,
    FabContainer,
    InitialTablePaginationState,
    Linkify,
    NoResults,
    OpenFilterFab,
    PageHeader,
    PaymentMethodChip,
    SearchInput,
    SelectMultiple,
    ShowFilterButton,
    TablePagination,
    TablePaginationHandler,
    UsedByPaymentMethod,
} from '@/components';
import type { SelectMultipleHandler } from '@/components';
import { SnackbarContext, StoreContext } from '@/context';
import { useFetchCategories, useFetchPaymentMethods, useFetchSubscriptions, useFetchTransactions } from '@/hooks';
import { Transaction } from '@/models';
import { SelectMultipleReducer, TablePaginationReducer, generateInitialState } from '@/reducer';
import { TransactionService } from '@/services';
import { DescriptionTableCellStyle } from '@/theme/description-table-cell.style';
import { filterTransactions } from '@/utils';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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

interface TransactionHandler {
    onSearch: (text: string) => void;
    onAddTransaction: (show: boolean) => void;
    onTransactionDelete: (transaction: Transaction) => void;
    pagination: TablePaginationHandler;
    selectMultiple: SelectMultipleHandler;
}

export const Transactions = () => {
    const { showSnackbar } = React.useContext(SnackbarContext);
    const { filter, setTransactions } = React.useContext(StoreContext);
    const fetchTransactions = useFetchTransactions();
    const fetchSubscriptions = useFetchSubscriptions();
    const fetchCategories = useFetchCategories();
    const fetchPaymentMethods = useFetchPaymentMethods();
    const [keyword, setKeyword] = React.useState('');
    const [, startTransition] = React.useTransition();
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
    const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);
    const [selectedTransactions, setSelectedTransactions] = React.useReducer(
        SelectMultipleReducer,
        generateInitialState()
    );

    const handler: TransactionHandler = {
        onSearch(text) {
            setKeyword(text.toLowerCase());
        },
        onAddTransaction(show) {
            setShowAddForm(show);
        },
        async onTransactionDelete(transaction) {
            try {
                const deletedTransactions = await transaction.delete();
                if (!deletedTransactions || deletedTransactions.length < 0) throw new Error('No transaction deleted');
                startTransition(() => {
                    setTransactions({
                        type: 'REMOVE_BY_ID',
                        id: transaction.id,
                    });
                });
                showSnackbar({ message: `Transaction ${transaction.receiver} deleted` });
            } catch (error) {
                console.error(error);
                showSnackbar({
                    message: `Could'nt delete transaction`,
                    action: <Button onClick={() => handler.onTransactionDelete(transaction)}>Retry</Button>,
                });
            }
        },
        pagination: {
            onPageChange(newPage) {
                setTablePagination({ type: 'CHANGE_PAGE', page: newPage });
            },
            onRowsPerPageChange(rowsPerPage) {
                setTablePagination({ type: 'CHANGE_ROWS_PER_PAGE', rowsPerPage: rowsPerPage });
            },
        },
        selectMultiple: {
            onSelectAll: (event, checked) => {
                startTransition(() => {
                    setSelectedTransactions({
                        type: 'SET_SELECTED',
                        selected:
                            selectedTransactions.selected.length > 0 &&
                            (selectedTransactions.selected.length < shownTransactions.length ||
                                shownTransactions.length === selectedTransactions.selected.length)
                                ? []
                                : shownTransactions.map(({ id }) => id),
                    });
                });
            },
            onSelectSingle: (event, checked) => {
                const item = Number(event.target.value);
                setSelectedTransactions(
                    checked ? { type: 'ADD_ITEM', item: item } : { type: 'REMOVE_ITEM', item: item }
                );
            },
            actionBar: {
                onEdit: () => {
                    setSelectedTransactions({ type: 'OPEN_DIALOG', dialog: 'EDIT' });
                },
                onDelete: () => {
                    setSelectedTransactions({ type: 'OPEN_DIALOG', dialog: 'DELETE' });
                },
            },
            dialog: {
                onEditConfirm: async (action, id) => {
                    try {
                        const result = await TransactionService.update(
                            selectedTransactions.selected,
                            action === 'CATEGORY' ? 'category' : 'paymentMethod',
                            id
                        );
                        if (result.length === 0) return showSnackbar({ message: 'No transactions were updated' });
                        await fetchTransactions.refresh();
                        setSelectedTransactions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
                        showSnackbar({ message: 'Transactions updated' });
                    } catch (error) {
                        console.error(error);
                        showSnackbar({
                            message: "Couln't update the transactions",
                            // @ts-expect-error
                            action: (
                                <Button onClick={() => handler.selectMultiple.dialog.onEditConfirm(action, id)}>
                                    Retry
                                </Button>
                            ),
                        });
                        setSelectedTransactions({ type: 'CLOSE_DIALOG' });
                    }
                },
                onEditCancel: () => {
                    setSelectedTransactions({ type: 'CLOSE_DIALOG' });
                },
                onDeleteCancel: () => {
                    setSelectedTransactions({ type: 'CLOSE_DIALOG' });
                },
                onDeleteConfirm: async () => {
                    try {
                        const result = await TransactionService.delete(selectedTransactions.selected);
                        setTransactions({
                            type: 'REMOVE_MULTIPLE_BY_ID',
                            ids: result.map((transaction) => transaction.id),
                        });
                        setSelectedTransactions({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
                        showSnackbar({ message: 'Transactions deleted' });
                    } catch (error) {
                        console.error(error);
                        showSnackbar({
                            message: "Couln't delete the transactions",
                            action: <Button onClick={handler.selectMultiple.dialog.onDeleteConfirm}>Retry</Button>,
                        });
                        setSelectedTransactions({ type: 'CLOSE_DIALOG' });
                    }
                },
            },
        },
    };

    const shownTransactions: Transaction[] = React.useMemo(() => {
        if (!fetchTransactions.transactions) return [];
        return filterTransactions(keyword, filter, fetchTransactions.transactions);
    }, [fetchTransactions.transactions, keyword, filter]);

    const currentPageTransactions: Transaction[] = React.useMemo(() => {
        const { page, rowsPerPage } = tablePagination;
        return shownTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [shownTransactions, tablePagination]);

    return (
        <Grid container spacing={3}>
            <PageHeader title="Transactions" description="What have you bought today?" />

            <Grid item xs={12} md={12} lg={12} xl={12}>
                <Card sx={{ p: 0 }}>
                    <Card.Header sx={{ p: 2, pb: 0 }}>
                        <Box>
                            <Card.Title>Transactions</Card.Title>
                            <Card.Subtitle>Manage your transactions</Card.Subtitle>
                        </Box>
                        <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}>
                            <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
                                <ShowFilterButton />
                                <SearchInput onSearch={handler.onSearch} />
                                <Tooltip title="Add Transaction">
                                    <IconButton color="primary" onClick={() => handler.onAddTransaction(true)}>
                                        <AddIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            </ActionPaper>
                        </Card.HeaderActions>
                    </Card.Header>
                    {fetchTransactions.loading ? (
                        <CircularProgress />
                    ) : shownTransactions.length > 0 ? (
                        <React.Fragment>
                            <Card.Body>
                                <SelectMultiple.Actions
                                    amount={selectedTransactions.selected.length}
                                    onEdit={handler.selectMultiple.actionBar.onEdit}
                                    onDelete={handler.selectMultiple.actionBar.onDelete}
                                />

                                <TableContainer>
                                    <Table sx={{ minWidth: 650 }} aria-label="Transaction Table">
                                        <TableHead>
                                            <TableRow>
                                                <SelectMultiple.SelectAllCheckbox
                                                    onChange={handler.selectMultiple.onSelectAll}
                                                    indeterminate={
                                                        selectedTransactions.selected.length > 0 &&
                                                        selectedTransactions.selected.length < shownTransactions.length
                                                    }
                                                    checked={
                                                        selectedTransactions.selected.length ===
                                                            shownTransactions.length &&
                                                        selectedTransactions.selected.length > 0
                                                    }
                                                    withTableCell
                                                />
                                                {[
                                                    'Date',
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
                                            {currentPageTransactions.map((transaction) => (
                                                <TableRow
                                                    key={transaction.id}
                                                    sx={{
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <SelectMultiple.SelectSingleCheckbox
                                                            value={transaction.id}
                                                            onChange={handler.selectMultiple.onSelectSingle}
                                                            checked={selectedTransactions.selected.includes(
                                                                transaction.id
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Typography fontWeight="bolder">{`${format(
                                                            new Date(transaction.date),
                                                            'dd.MM.yy'
                                                        )}`}</Typography>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <CategoryChip category={transaction.categories} />
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Linkify>{transaction.receiver}</Linkify>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <Typography>
                                                            {transaction.amount.toLocaleString('de', {
                                                                style: 'currency',
                                                                currency: 'EUR',
                                                            })}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell size={AppConfig.table.cellSize}>
                                                        <PaymentMethodChip paymentMethod={transaction.paymentMethods} />
                                                    </TableCell>
                                                    <TableCell
                                                        sx={DescriptionTableCellStyle}
                                                        size={AppConfig.table.cellSize}
                                                    >
                                                        <Linkify>{transaction.description ?? 'No information'}</Linkify>
                                                    </TableCell>
                                                    <TableCell align="right" size={AppConfig.table.cellSize}>
                                                        <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                                                            <Tooltip title="Edit" placement="top">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => setEditTransaction(transaction)}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete" placement="top">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() =>
                                                                        handler.onTransactionDelete(transaction)
                                                                    }
                                                                >
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
                                    count={shownTransactions.length}
                                    onPageChange={handler.pagination.onPageChange}
                                    onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                                />
                            </Card.Footer>
                        </React.Fragment>
                    ) : (
                        <NoResults sx={{ m: 2 }} text="No transactions found" withFilters />
                    )}
                </Card>
            </Grid>

            <Grid item xs={12} md={4} lg={4} xl={4}>
                {!fetchCategories.loading && !fetchTransactions.loading && (
                    <EarningsByCategory
                        categories={fetchCategories.categories}
                        transactions={fetchTransactions.transactions}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={4} lg={4} xl={4}>
                {!fetchPaymentMethods.loading && !fetchTransactions.loading && !fetchSubscriptions.subscriptions && (
                    <UsedByPaymentMethod
                        paymentMethods={fetchPaymentMethods.paymentMethods}
                        transactions={fetchTransactions.transactions}
                        subscriptions={fetchSubscriptions.subscriptions}
                    />
                )}
            </Grid>

            <FabContainer>
                <OpenFilterFab />
                <CreateFab onClick={() => handler.onAddTransaction(true)} />
            </FabContainer>
            <SelectMultiple.EditDialog
                open={selectedTransactions.dialog.show && selectedTransactions.dialog.type === 'EDIT'}
                onCancel={handler.selectMultiple.dialog.onEditCancel!}
                onUpdate={handler.selectMultiple.dialog.onEditConfirm!}
            />
            <SelectMultiple.ConfirmDeleteDialog
                open={selectedTransactions.dialog.show && selectedTransactions.dialog.type === 'DELETE'}
                onCancel={handler.selectMultiple.dialog.onDeleteCancel!}
                onConfirm={handler.selectMultiple.dialog.onDeleteConfirm!}
            />

            <CreateTransaction open={showAddForm} setOpen={(show) => setShowAddForm(show)} />

            <EditTransaction
                open={editTransaction !== null}
                setOpen={(show) => {
                    if (!show) setEditTransaction(null);
                }}
                transaction={editTransaction}
            />
        </Grid>
    );
};
