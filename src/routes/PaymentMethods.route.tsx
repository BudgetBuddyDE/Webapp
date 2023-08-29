import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppConfig } from '@/app.config';
import { ActionPaper, Card } from '@/components/Base';
import {
  AddFab,
  CircularProgress,
  FabContainer,
  InitialTablePaginationState,
  Linkify,
  NoResults,
  TablePagination,
  type TablePaginationHandler,
  TablePaginationReducer,
  usePagination,
} from '@/components/Core';
import { SearchInput } from '@/components/Inputs';
import { PageHeader } from '@/components/Layout';
import { CreatePaymentMethod } from '@/components/PaymentMethod/CreatePaymentMethodDrawer.component';
import { EditPaymentMethodDrawer } from '@/components/PaymentMethod/EditPaymentmethodDrawer.component';
import { RedirectChip } from '@/components/RedirectChip.component';
import { SelectMultiple, type SelectMultipleHandler } from '@/components/SelectMultiple';
import { SnackbarContext } from '@/context';
import { useFetchPaymentMethods } from '@/hook';
import { PaymentMethod } from '@/models';
import { SelectMultipleReducer, generateInitialState } from '@/reducer/SelectMultuple.reducer';
import { PaymentMethodService } from '@/services/PaymentMethod.service';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { AddRounded as AddIcon, DeleteRounded as DeleteIcon, EditRounded as EditIcon } from '@mui/icons-material';
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

export interface PaymentMethodHandler {
  clearLocatioState: () => void;
  onSearch: (keyword: string) => void;
  pagination: TablePaginationHandler;
  paymentMethod: {
    onDelete: (paymentMethod: PaymentMethod) => void;
  };
  selectMultiple: SelectMultipleHandler;
}

const PaymentMethodsRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [tablePagination, setTablePagination] = React.useReducer(TablePaginationReducer, InitialTablePaginationState);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = React.useReducer(
    SelectMultipleReducer,
    generateInitialState()
  );
  const {
    loading: loadingPaymentMethods,
    refresh: refreshPaymentMethods,
    paymentMethods,
    fetched: arePaymentMethodsFetched,
  } = useFetchPaymentMethods();
  const [keyword, setKeyword] = React.useState('');
  const shownPaymentMethods: PaymentMethod[] = React.useMemo(() => {
    if (keyword === '') return paymentMethods;
    return paymentMethods.filter(
      (item) => item.name.toLowerCase().includes(keyword) || item.provider.toLowerCase().includes(keyword)
    );
  }, [keyword, paymentMethods]);
  const currentPagePaymentMethods = usePagination(shownPaymentMethods, tablePagination);
  const [showAddForm, setShowAddForm] = React.useState(
    location.state !== null && (location.state as any).create !== undefined && (location.state as any).create === true
  );
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = React.useState<PaymentMethod | null>(null);

  const handler: PaymentMethodHandler = {
    clearLocatioState() {
      window.history.replaceState(null, '');
    },
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
    paymentMethod: {
      async onDelete(paymentMethod) {
        try {
          const deletedPaymentMethods = await paymentMethod.delete();
          if (!deletedPaymentMethods || deletedPaymentMethods.length < 1) throw new Error('No payment-method deleted');
          await refreshPaymentMethods();
          showSnackbar({ message: `Payment Method ${paymentMethod.name} deleted` });
        } catch (error) {
          console.error(error);
          showSnackbar({
            message: `Could'nt delete payment method`,
            action: <Button onClick={() => handler.paymentMethod.onDelete(paymentMethod)}>Retry</Button>,
          });
        }
      },
    },
    selectMultiple: {
      onSelectAll: (_event, _checked) => {
        setSelectedPaymentMethods({
          type: 'SET_SELECTED',
          selected:
            selectedPaymentMethods.selected.length > 0 &&
            (selectedPaymentMethods.selected.length < shownPaymentMethods.length ||
              shownPaymentMethods.length === selectedPaymentMethods.selected.length)
              ? []
              : shownPaymentMethods.map(({ id }) => id),
        });
      },
      onSelectSingle: (event, checked) => {
        const item = Number(event.target.value);
        setSelectedPaymentMethods(checked ? { type: 'ADD_ITEM', item: item } : { type: 'REMOVE_ITEM', item: item });
      },
      actionBar: {
        onEdit: () => {
          setSelectedPaymentMethods({ type: 'OPEN_DIALOG', dialog: 'EDIT' });
        },
        onDelete: () => {
          setSelectedPaymentMethods({ type: 'OPEN_DIALOG', dialog: 'DELETE' });
        },
      },
      dialog: {
        onDeleteCancel: () => {
          setSelectedPaymentMethods({ type: 'CLOSE_DIALOG' });
        },
        onDeleteConfirm: async () => {
          try {
            const selectedItems = selectedPaymentMethods.selected,
              selectedItemsCount = selectedItems.length;
            if (selectedItemsCount == 0) throw new Error('No payment-methods were selected');
            const result = await PaymentMethodService.delete(selectedItems);
            if (selectedItemsCount != result.length) throw new Error("Couldn't delete all selected payment-methods");
            await refreshPaymentMethods();
            setSelectedPaymentMethods({ type: 'CLOSE_DIALOG_AFTER_DELETE' });
            showSnackbar({ message: `${selectedItemsCount} payment-methods deleted` });
          } catch (error) {
            console.error(error);
            showSnackbar({
              message: "Couln't delete the payment-methods",
              action: <Button onClick={handler.selectMultiple.dialog.onDeleteConfirm}>Retry</Button>,
            });
            setSelectedPaymentMethods({ type: 'CLOSE_DIALOG' });
          }
        },
      },
    },
  };

  React.useEffect(() => {
    return () => handler.clearLocatioState();
  }, []);

  return (
    <Grid container spacing={3}>
      <PageHeader title="Payment Methods" description="How are u paying today, sir?" />

      <Grid item xs={12} md={10} lg={10} xl={10}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Payment Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>
            <Card.HeaderActions sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}>
              <ActionPaper sx={{ display: 'flex', flexDirection: 'row', width: { xs: '100%' } }}>
                <SearchInput onSearch={handler.onSearch} />
                <Tooltip title="Add Payment Method">
                  <IconButton color="primary" onClick={() => setShowAddForm(true)}>
                    <AddIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </ActionPaper>
            </Card.HeaderActions>
          </Card.Header>
          {loadingPaymentMethods && !arePaymentMethodsFetched ? (
            <CircularProgress />
          ) : shownPaymentMethods.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <SelectMultiple.Actions
                  amount={selectedPaymentMethods.selected.length}
                  onDelete={handler.selectMultiple.actionBar.onDelete}
                />
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="Payment Methods Table">
                    <TableHead>
                      <TableRow>
                        <SelectMultiple.SelectAllCheckbox
                          onChange={handler.selectMultiple.onSelectAll}
                          indeterminate={
                            selectedPaymentMethods.selected.length > 0 &&
                            selectedPaymentMethods.selected.length < shownPaymentMethods.length
                          }
                          checked={
                            selectedPaymentMethods.selected.length === shownPaymentMethods.length &&
                            selectedPaymentMethods.selected.length > 0
                          }
                          withTableCell
                        />

                        {['Name', 'Provider', 'Address', 'Description', ''].map((cell, index) => (
                          <TableCell key={index} size={AppConfig.table.cellSize}>
                            <Typography fontWeight="bolder">{cell}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPagePaymentMethods.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <TableCell size={AppConfig.table.cellSize}>
                            <SelectMultiple.SelectSingleCheckbox
                              value={row.id}
                              onChange={handler.selectMultiple.onSelectSingle}
                              checked={selectedPaymentMethods.selected.includes(row.id)}
                            />
                          </TableCell>
                          <TableCell size={AppConfig.table.cellSize}>
                            <Typography>
                              <RedirectChip item={row} />
                            </Typography>
                          </TableCell>
                          <TableCell size={AppConfig.table.cellSize}>
                            <Linkify>{row.provider}</Linkify>
                          </TableCell>
                          <TableCell size={AppConfig.table.cellSize}>
                            <Linkify>{row.address}</Linkify>
                          </TableCell>
                          <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                            <Linkify>{row.description ?? 'No description'}</Linkify>
                          </TableCell>
                          <TableCell align="right" size={AppConfig.table.cellSize}>
                            <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton color="primary" onClick={() => setEditPaymentMethod(row)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton color="primary" onClick={() => handler.paymentMethod.onDelete(row)}>
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
                  count={shownPaymentMethods.length}
                  onPageChange={handler.pagination.onPageChange}
                  onRowsPerPageChange={handler.pagination.onRowsPerPageChange}
                />
              </Card.Footer>
            </React.Fragment>
          ) : (
            <NoResults sx={{ m: 2 }} text="No payment-methods found" />
          )}
        </Card>
      </Grid>

      {/* FIXME: <Grid container item xs={12} md={3} lg={4} xl={3} spacing={3}>
                <Grid item xs={12}>
                    {!fetchPaymentMethods.loading && !fetchSubscriptions.loading && !fetchTransactions.loading && (
                        <UsedByPaymentMethod
                            paymentMethods={fetchPaymentMethods.paymentMethods}
                            transactions={fetchTransactions.transactions}
                            subscriptions={fetchSubscriptions.subscriptions}
                        />
                    )}
                </Grid>

                <Grid item xs={12}>
                    {!fetchPaymentMethods.loading && !fetchTransactions.loading && (
                        <EarningsByPaymentMethod
                            paymentMethods={fetchPaymentMethods.paymentMethods}
                            transactions={fetchTransactions.transactions}
                        />
                    )}
                </Grid>
            </Grid> */}

      <FabContainer>
        <AddFab onClick={() => setShowAddForm(true)} />
      </FabContainer>

      <SelectMultiple.ConfirmDeleteDialog
        open={selectedPaymentMethods.dialog.show && selectedPaymentMethods.dialog.type === 'DELETE'}
        onCancel={handler.selectMultiple.dialog.onDeleteCancel!}
        onConfirm={handler.selectMultiple.dialog.onDeleteConfirm!}
      />

      <CreatePaymentMethod
        open={showAddForm}
        setOpen={(show) => {
          // If an location.state is set and used to create an payment-method
          // we're gonna clear that state after it got closed (in order to remove the default paymentMethod)
          if (
            !show &&
            location.state !== null &&
            (location.state as any).create === true &&
            (location.state as any).category !== undefined
          ) {
            navigate(location.pathname, { replace: true, state: null });
          }
          setShowAddForm(show);
        }}
        paymentMethod={
          location.state &&
          (location.state as any).create !== undefined &&
          (location.state as any).paymentMethod !== undefined
            ? (location.state as any).paymentMethod
            : undefined
        }
      />

      <EditPaymentMethodDrawer
        open={showEditForm}
        setOpen={(show) => {
          setShowEditForm(show);
          if (!show) setEditPaymentMethod(null);
        }}
        paymentMethod={editPaymentMethod}
      />
    </Grid>
  );
};

export default PaymentMethodsRoute;
