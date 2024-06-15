import {type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {Button, Grid} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {AppConfig, Feature} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {withAuthLayout} from '@/components/Auth/Layout';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag.component';
import {ContentGrid} from '@/components/Layout';
import {CircularProgress} from '@/components/Loading';
import {MetalQuoteList} from '@/components/Metals';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  PortfolioDiversityChart,
  StockLayout,
  StockService,
  StockWatchlist,
  useFetchStockPositions,
  useFetchStockWatchlist,
  useStockStore,
} from '@/components/Stocks';
import {StockPositionTable} from '@/components/Stocks/Position';
import {StockPositionDrawer, type TStockPositionDrawerValues} from '@/components/Stocks/StockPositionDrawer.component';
import {getSocketIOClient} from '@/utils';

interface IStocksHandler {
  showCreateDialog: (payload?: Partial<TStockPositionDrawerValues>) => void;
  showEditDialog: (stockPosition: TStockPositionWithQuote) => void;
  onCancelDeletePosition: () => void;
  onConfirmDeletePosition: () => void;
}

export const Stocks = () => {
  const navigate = useNavigate();
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
  const {loading: isLoadingWatchlist, assets: watchedAssets} = useFetchStockWatchlist();
  const [stockPositionDrawer, dispatchStockPositionDrawer] = React.useReducer(
    useEntityDrawer<TStockPositionDrawerValues>,
    UseEntityDrawerDefaultState<TStockPositionDrawerValues>(),
  );

  const handler: IStocksHandler = {
    showCreateDialog(payload) {
      dispatchStockPositionDrawer({type: 'OPEN', drawerAction: 'CREATE', payload: payload});
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
    <StockLayout
      onSelectAsset={({identifier}) => navigate(`/stocks/${identifier}`)}
      onOpenPosition={({name, logo, identifier, type}) => {
        handler.showCreateDialog({stock: {type, isin: identifier, label: name, logo}});
      }}>
      <ContentGrid title="Stocks" description={'Manage your positions'}>
        <Grid item xs={12} md={8.5} lg={8.5} xl={9}>
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

        <Grid container item xs={12} md={3.5} lg={3.5} xl={3} spacing={AppConfig.baseSpacing}>
          <Grid item xs={12}>
            <MetalQuoteList />
          </Grid>

          <Grid item xs={12}>
            {loadingStockPositions ? <CircularProgress /> : <PortfolioDiversityChart positions={stockPositions} />}
          </Grid>

          <Grid item xs={12}>
            {!isLoadingWatchlist ? (
              <StockWatchlist title="Watchlist" subtitle="Watched assets" data={watchedAssets} />
            ) : (
              <CircularProgress />
            )}
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
    </StockLayout>
  );
};

export default withFeatureFlag(Feature.STOCKS, withAuthLayout(Stocks), true);
