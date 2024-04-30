import React from 'react';
import {ContentGrid} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {Button, Grid} from '@mui/material';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  PortfolioDiversityChart,
  useFetchStockPositions,
  StockService,
  useStockStore,
  StockList,
} from '@/components/Stocks';
import {getSocketIOClient} from '@/utils';
import {CircularProgress} from '@/components/Loading';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {useAuthContext} from '@/components/Auth';
import {type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {StockPositionTable} from '@/components/Stocks/Position';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {StockPositionDrawer, type TStockPositionDrawerValues} from '@/components/Stocks/StockPositionDrawer.component';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag.component';
import {Feature} from '@/app.config';

interface IStocksHandler {
  showCreateDialog: () => void;
  showEditDialog: (stockPosition: TStockPositionWithQuote) => void;
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
  const [stockPositionDrawer, dispatchStockPositionDrawer] = React.useReducer(
    useEntityDrawer<TStockPositionDrawerValues>,
    UseEntityDrawerDefaultState<TStockPositionDrawerValues>(),
  );

  const handler: IStocksHandler = {
    showCreateDialog() {
      dispatchStockPositionDrawer({type: 'OPEN', drawerAction: 'CREATE'});
    },
    showEditDialog({id, bought_at, buy_in, quantity, currency, isin, name, logo, expand: {exchange}}) {
      dispatchStockPositionDrawer({
        type: 'OPEN',
        drawerAction: 'UPDATE',
        payload: {
          id,
          bought_at,
          currency,
          buy_in,
          exchange: {
            label: exchange.name,
            ticker: exchange.symbol,
            value: exchange.id,
          },
          quantity,
          stock: {
            type: 'Aktie',
            isin,
            label: name,
            logo,
          },
        },
      });
    },
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
          onAddPosition={handler.showCreateDialog}
          onEditPosition={handler.showEditDialog}
          onDeletePosition={position => {
            setShowDeletePositionDialog(true);
            setDeletePosition(position);
          }}
        />
      </Grid>

      <Grid container item xs={12} md={3} spacing={2}>
        <Grid item xs={12}>
          {loadingStockPositions ? <CircularProgress /> : <PortfolioDiversityChart positions={stockPositions} />}
        </Grid>

        <Grid item xs={12}>
          <StockList title="Watchlist" data={[]} />
        </Grid>
      </Grid>

      <StockPositionDrawer
        {...stockPositionDrawer}
        onClose={() => dispatchStockPositionDrawer({type: 'CLOSE'})}
        closeOnBackdropClick
        closeOnEscape
      />

      <DeleteDialog
        open={showDeletePositionDialog}
        onClose={handler.onCancelDeletePosition}
        onCancel={handler.onCancelDeletePosition}
        onConfirm={handler.onConfirmDeletePosition}
        withTransition
      />
    </ContentGrid>
  );
};

export default withFeatureFlag(Feature.STOCKS, withAuthLayout(Stocks), true);
