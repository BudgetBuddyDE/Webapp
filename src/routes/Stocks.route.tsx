import React from 'react';
import {ContentGrid} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {Button, Grid} from '@mui/material';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  AddStockPositionDrawer,
  PortfolioDiversityChart,
  useFetchStockPositions,
  StockService,
  useStockStore,
  EditStockPositionDrawer,
} from '@/components/Stocks';
import {getSocketIOClient} from '@/utils';
import {CircularProgress} from '@/components/Loading';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {useAuthContext} from '@/components/Auth';
import {
  type TUpdateStockPositionPayload,
  type TCreateStockPositionPayload,
  type TStockPositionWithQuote,
} from '@budgetbuddyde/types';
import {StockPositionTable} from '@/components/Stocks/Position';

interface IStocksHandler {
  onAddPosition: () => void;
  onEditPosition: (position: TStockPositionWithQuote) => void;
  onCancelDeletePosition: () => void;
  onConfirmDeletePosition: () => void;
}

export const Stocks = () => {
  const {sessionUser} = useAuthContext();
  const {updateQuote} = useStockStore();
  const socket = getSocketIOClient();
  const {showSnackbar} = useSnackbarContext();
  const [showDeletePositionDialog, setShowDeletePositionDialog] = React.useState(false);
  const [deletePosition, setDeletePosition] = React.useState<TStockPositionWithQuote | null>(null);
  const {
    loading: loadingStockPositions,
    positions: stockPositions,
    refresh: refreshStockPositions,
  } = useFetchStockPositions();
  const [showAddDrawer, dispatchAddDrawer] = React.useReducer(
    useEntityDrawer<TCreateStockPositionPayload>,
    CreateEntityDrawerState<TCreateStockPositionPayload>(),
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TUpdateStockPositionPayload>,
    CreateEntityDrawerState<TUpdateStockPositionPayload>(),
  );

  const handler: IStocksHandler = {
    onCancelDeletePosition() {
      setDeletePosition(null);
      setShowDeletePositionDialog(false);
    },
    async onConfirmDeletePosition() {
      if (!deletePosition || !sessionUser) return;

      const [position, error] = await StockService.deletePosition({id: deletePosition.id});
      if (error) {
        showSnackbar({
          message: error.message,
          action: <Button onClick={() => handler.onConfirmDeletePosition()}>Retry</Button>,
        });
        console.error(error);
        return;
      }
      if (!position || !position.success) {
        showSnackbar({
          message: 'Error deleting position',
          action: <Button onClick={() => handler.onConfirmDeletePosition()}>Retry</Button>,
        });
        return;
      }

      showSnackbar({message: 'Position deleted'});
      setShowDeletePositionDialog(false);
      setDeletePosition(null);
      React.startTransition(() => {
        refreshStockPositions();
      });
    },
    onAddPosition() {
      dispatchAddDrawer({type: 'open'});
    },
    onEditPosition({bought_at, buy_in, expand: {exchange}, id, isin, quantity}) {
      if (!sessionUser) throw new Error('sessionUser is null!');
      dispatchEditDrawer({
        type: 'open',
        payload: {
          owner: sessionUser.id,
          currency: 'EUR',
          bought_at: bought_at,
          buy_in: buy_in,
          exchange: exchange.id,
          id: id,
          isin: isin,
          quantity: quantity,
        },
      });
    },
  };

  React.useLayoutEffect(() => {
    if (!sessionUser || loadingStockPositions || stockPositions.length === 0) return;
    const subscribedAssets: {isin: string; exchange: string}[] = [
      ...new Set(
        stockPositions.map(
          ({
            isin,
            expand: {
              exchange: {exchange},
            },
          }) => ({isin, exchange}),
        ),
      ),
    ];

    socket.connect();

    socket.emit('stock:subscribe', subscribedAssets, sessionUser.id);

    socket.on(
      `stock:update:${sessionUser.id}`,
      (data: {exchange: string; isin: string; quote: {datetime: string; currency: string; price: number}}) => {
        console.log('stock:update', data);
        updateQuote(data.exchange, data.isin, data.quote.price);
      },
    );

    return () => {
      socket.emit('stock:unsubscribe', subscribedAssets, sessionUser.id);
      socket.disconnect();
    };
  }, [sessionUser, socket, stockPositions, loadingStockPositions]);

  return (
    <ContentGrid title="Stocks" description={'Manage your positions'}>
      <Grid item xs={12} md={9} lg={9} xl={9}>
        <StockPositionTable
          withRedirect
          onAddPosition={() => dispatchAddDrawer({type: 'open'})}
          onEditPosition={handler.onEditPosition}
          onDeletePosition={position => {
            setShowDeletePositionDialog(true);
            setDeletePosition(position);
          }}
        />
      </Grid>

      <Grid item xs={12} md={3}>
        {loadingStockPositions ? <CircularProgress /> : <PortfolioDiversityChart positions={stockPositions} />}
      </Grid>

      <DeleteDialog
        open={showDeletePositionDialog}
        onClose={handler.onCancelDeletePosition}
        onCancel={handler.onCancelDeletePosition}
        onConfirm={handler.onConfirmDeletePosition}
        withTransition
      />

      <AddStockPositionDrawer {...showAddDrawer} onClose={() => dispatchAddDrawer({type: 'close'})} />

      <EditStockPositionDrawer {...showEditDrawer} onClose={() => dispatchEditDrawer({type: 'close'})} />
    </ContentGrid>
  );
};

export default withAuthLayout(Stocks);
