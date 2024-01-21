import React from 'react';
import { ActionPaper, Linkify } from '@/components/Base';
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
import { Checkbox, Grid, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { DeleteDialog } from '@/components/DeleteDialog.component';
import { SearchInput } from '@/components/Base/Search';
import { AddRounded, DeleteRounded, EditRounded } from '@mui/icons-material';
import { Table } from '@/components/Base/Table';
import { AppConfig } from '@/app.config';
import { DescriptionTableCellStyle } from '@/style/DescriptionTableCell.style';
import { useEntityDrawer, CreateEntityDrawerState } from '@/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { type ISelectionHandler } from '@/components/Base/Select';

interface IPaymentMethodsHandler {
  onSearch: (keyword: string) => void;
  onCreatePaymentMethod: (payload?: TCreatePaymentMethodDrawerPayload) => void;
  onPaymentMethodDelete: (paymentMethod: TPaymentMethod) => void;
  onConfirmPaymentMethodDelete: () => void;
  onEditPaymentMethod: (paymentMethod: TPaymentMethod) => void;
  selection: ISelectionHandler<TPaymentMethod>;
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
  const [showCreateDrawer, dispatchCreateDrawer] = React.useReducer(
    useEntityDrawer<TCreatePaymentMethodDrawerPayload>,
    CreateEntityDrawerState<TCreatePaymentMethodDrawerPayload>()
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TEditPaymentMethodDrawerPayload>,
    CreateEntityDrawerState<TEditPaymentMethodDrawerPayload>()
  );
  const [showDeletePaymentMethodDialog, setShowDeletePaymentMethodDialog] = React.useState(false);
  const [deletePaymentMethods, setDeletePaymentMethods] = React.useState<TPaymentMethod[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = React.useState<TPaymentMethod[]>([]);
  const [keyword, setKeyword] = React.useState('');
  const displayedPaymentMethods: TPaymentMethod[] = React.useMemo(() => {
    if (keyword.length == 0) return paymentMethods;
    return paymentMethods.filter(({ name }) => name.toLowerCase().includes(keyword.toLowerCase()));
  }, [paymentMethods, keyword]);

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
        if (deletePaymentMethods.length === 0) return;
        const [deletedItem, error] = await PaymentMethodService.delete(
          deletePaymentMethods.map(({ id }) => ({ paymentMethodId: id })),
          authOptions
        );
        if (error) {
          return showSnackbar({ message: error.message });
        }
        if (!deletedItem) {
          return showSnackbar({ message: "Couldn't delete the payment-method" });
        }

        setShowDeletePaymentMethodDialog(false);
        setDeletePaymentMethods([]);
        refreshPaymentMethods(); // FIXME: Wrap inside startTransition
        showSnackbar({ message: `Payment-method we're deleted` });
        setSelectedPaymentMethods([]);
      } catch (error) {
        console.error(error);
      }
    },
    onPaymentMethodDelete(paymentMethod) {
      setShowDeletePaymentMethodDialog(true);
      setDeletePaymentMethods([paymentMethod]);
    },
    selection: {
      onSelectAll(shouldSelectAll) {
        setSelectedPaymentMethods(shouldSelectAll ? displayedPaymentMethods : []);
      },
      onSelect(entity) {
        if (this.isSelected(entity)) {
          setSelectedPaymentMethods((prev) => prev.filter(({ id }) => id !== entity.id));
        } else setSelectedPaymentMethods((prev) => [...prev, entity]);
      },
      isSelected(entity) {
        return selectedPaymentMethods.find((elem) => elem.id === entity.id) !== undefined;
      },
      onDeleteMultiple() {
        setShowDeletePaymentMethodDialog(true);
        setDeletePaymentMethods(selectedPaymentMethods);
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
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Table<TPaymentMethod>
          isLoading={loadingPaymentMethods}
          title="Payment Methods"
          subtitle="Manage your payment methods"
          data={displayedPaymentMethods}
          headerCells={['Name', 'Address', 'Provider', 'Description', '']}
          renderHeaderCell={(headerCell) => (
            <TableCell
              key={headerCell.replaceAll(' ', '_').toLowerCase()}
              size={AppConfig.table.cellSize}
            >
              <Typography fontWeight="bolder">{headerCell}</Typography>
            </TableCell>
          )}
          renderRow={(paymentMethod) => (
            <TableRow
              key={paymentMethod.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                whiteSpace: 'nowrap',
              }}
            >
              <TableCell>
                <Checkbox
                  checked={handler.selection.isSelected(paymentMethod)}
                  onChange={() => handler.selection.onSelect(paymentMethod)}
                />
              </TableCell>
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
          )}
          tableActions={
            <React.Fragment>
              <SearchInput onSearch={handler.onSearch} />

              <IconButton color="primary" onClick={() => handler.onCreatePaymentMethod()}>
                <AddRounded fontSize="inherit" />
              </IconButton>
            </React.Fragment>
          }
          withSelection
          onSelectAll={handler.selection.onSelectAll}
          amountOfSelectedEntities={selectedPaymentMethods.length}
          onDelete={() => {
            if (handler.selection.onDeleteMultiple) handler.selection.onDeleteMultiple();
          }}
        />
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
          setDeletePaymentMethods([]);
        }}
        onCancel={() => {
          setShowDeletePaymentMethodDialog(false);
          setDeletePaymentMethods([]);
        }}
        onConfirm={() => handler.onConfirmPaymentMethodDelete()}
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
