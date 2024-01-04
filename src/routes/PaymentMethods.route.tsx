import React from 'react';
import { ActionPaper, Card, Linkify, NoResults } from '@/components/Base';
import {
  PaginationReducer,
  type PaginationHandler,
  InitialPaginationState,
  usePagination,
  Pagination,
} from '@/components/Base/Pagination';
import { AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { useAuthContext } from '@/core/Auth';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  CreatePaymentMethodDrawer,
  EditPaymentMethodDrawer,
  PaymentMethodChip,
  PaymentMethodService,
  type TCreatePaymentMethodDrawerPayload,
  type TEditPaymentMethodDrawerPayload,
  useFetchPaymentMethods,
} from '@/core/PaymentMethod';
import { useSnackbarContext } from '@/core/Snackbar';
import type { TPaymentMethod } from '@budgetbuddyde/types';
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
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { SearchInput } from '@/components/Base/Search';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import { CircularProgress } from '@/components/Loading';
import { Table } from '@/components/Base/Table';
import { AppConfig } from '@/app.config';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { useEntityDrawer, CreateEntityDrawerState } from '@/hooks';
import { useNavigate, useLocation } from 'react-router-dom';

interface IPaymentMethodsHandler {
  onSearch: (keyword: string) => void;
  onCreatePaymentMethod: (payload?: TCreatePaymentMethodDrawerPayload) => void;
  onPaymentMethodDelete: (paymentMethod: TPaymentMethod) => void;
  onConfirmPaymentMethodDelete: () => void;
  onEditPaymentMethod: (paymentMethod: TPaymentMethod) => void;
  pagination: PaginationHandler;
}

export const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    paymentMethods,
    loading: loadingPaymentMethods,
    refresh: refreshPaymentMethods,
  } = useFetchPaymentMethods();
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const [tablePagination, setTablePagination] = React.useReducer(
    PaginationReducer,
    InitialPaginationState
  );
  const [showCreateDrawer, dispatchCreateDrawer] = React.useReducer(
    useEntityDrawer<TCreatePaymentMethodDrawerPayload>,
    CreateEntityDrawerState<TCreatePaymentMethodDrawerPayload>()
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TEditPaymentMethodDrawerPayload>,
    CreateEntityDrawerState<TEditPaymentMethodDrawerPayload>()
  );
  const [showDeletePaymentMethodDialog, setShowDeletePaymentMethodDialog] = React.useState(false);
  const [deletePaymentMethod, setDeletePaymentMethod] = React.useState<TPaymentMethod | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const displayedPaymentMethods: TPaymentMethod[] = React.useMemo(() => {
    if (keyword.length == 0) return paymentMethods;
    return paymentMethods.filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()));
  }, [paymentMethods, keyword, tablePagination]);
  const currentPagePaymentMethod = usePagination(displayedPaymentMethods, tablePagination);

  const handler: IPaymentMethodsHandler = {
    onSearch(keyword) {
      setKeyword(keyword.toLowerCase());
    },
    onCreatePaymentMethod(payload?: TCreatePaymentMethodDrawerPayload) {
      dispatchCreateDrawer({ type: 'open', payload });
    },
    onEditPaymentMethod(paymentMethod) {
      dispatchEditDrawer({ type: 'open', payload: paymentMethod });
    },
    async onConfirmPaymentMethodDelete() {
      try {
        if (!deletePaymentMethod) return;
        const [deletedItem, error] = await PaymentMethodService.delete(
          { paymentMethodId: deletePaymentMethod.id },
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the payment-method" });
        }

        setShowDeletePaymentMethodDialog(false);
        setDeletePaymentMethod(null);
        refreshPaymentMethods(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Deleted payment-method ${deletedItem.name}` });
      } catch (error) {
        console.error(error);
      }
    },
    onPaymentMethodDelete(paymentMethod) {
      setShowDeletePaymentMethodDialog(true);
      setDeletePaymentMethod(paymentMethod);
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

  React.useEffect(() => {
    if (!location.search) return;
    const queryParams = new URLSearchParams(location.search);
    if (!queryParams.has('create') || queryParams.size < 2) return;
    const payload: TCreatePaymentMethodDrawerPayload = {
      name: queryParams.get('paymentMethod') ?? '',
      address: queryParams.get('address') ?? '',
      provider: queryParams.get('provider') ?? '',
      description: queryParams.get('description'),
    };
    handler.onCreatePaymentMethod(payload);
  }, [location.search]);

  return (
    <ContentGrid title={'Payment-Methods'}>
      <Grid item xs={12} md={12} lg={10} xl={10}>
        <Card sx={{ p: 0 }}>
          <Card.Header sx={{ p: 2, pb: 0 }}>
            <Box>
              <Card.Title>Payment-Methods</Card.Title>
              <Card.Subtitle>Manage your payment-methods</Card.Subtitle>
            </Box>

            <Card.HeaderActions
              sx={{ mt: { xs: 1, md: 0 }, width: { xs: '100%', md: 'unset' } }}
              actionPaperProps={{
                sx: { display: 'flex', flexDirection: 'row', width: { xs: '100%' } },
              }}
            >
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => handler.onCreatePaymentMethod()}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </Card.HeaderActions>
          </Card.Header>
          {loadingPaymentMethods && <CircularProgress />}
          {!loadingPaymentMethods && currentPagePaymentMethod.length > 0 ? (
            <React.Fragment>
              <Card.Body>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['Name', 'Address', 'Provider', 'Description', ''].map((cell, index) => (
                        <TableCell key={index} size={AppConfig.table.cellSize}>
                          <Typography fontWeight="bolder">{cell}</Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPagePaymentMethod.map((paymentMethod) => (
                      <TableRow
                        key={paymentMethod.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <TableCell size={AppConfig.table.cellSize}>
                          <PaymentMethodChip paymentMethod={paymentMethod} />
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          {/* TODO: Format when is IBAN */}
                          <Typography>{paymentMethod.address}</Typography>
                        </TableCell>
                        <TableCell size={AppConfig.table.cellSize}>
                          <Typography>{paymentMethod.provider}</Typography>
                        </TableCell>
                        <TableCell sx={DescriptionTableCellStyle} size={AppConfig.table.cellSize}>
                          <Linkify>{paymentMethod.description ?? 'No Description'}</Linkify>
                        </TableCell>
                        <TableCell align="right" size={AppConfig.table.cellSize}>
                          <ActionPaper sx={{ width: 'fit-content', ml: 'auto' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onEditPaymentMethod(paymentMethod)}
                            >
                              <EditRounded />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handler.onPaymentMethodDelete(paymentMethod)}
                            >
                              <DeleteRounded />
                            </IconButton>
                          </ActionPaper>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card.Body>
              <Card.Footer sx={{ p: 2, pt: 0 }}>
                <Pagination
                  {...tablePagination}
                  count={displayedPaymentMethods.length}
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

      <CreatePaymentMethodDrawer
        {...showCreateDrawer}
        onClose={() => {
          navigate(location.pathname, { replace: true });
          dispatchCreateDrawer({ type: 'close' });
        }}
      />

      <EditPaymentMethodDrawer
        {...showEditDrawer}
        onClose={() => dispatchEditDrawer({ type: 'close' })}
      />

      <DeleteDialog
        open={showDeletePaymentMethodDialog}
        onClose={() => {
          setShowDeletePaymentMethodDialog(false);
          setDeletePaymentMethod(null);
        }}
        onCancel={() => {
          setShowDeletePaymentMethodDialog(false);
          setDeletePaymentMethod(null);
        }}
        onConfirm={handler.onConfirmPaymentMethodDelete}
        withTransition
      />

      <FabContainer>
        <OpenFilterDrawerFab />
        <AddFab onClick={() => handler.onCreatePaymentMethod()} />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(PaymentMethods);
