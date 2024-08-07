import {ZAddWatchlistAssetPayload, ZDeleteWatchlistAssetPayload} from '@budgetbuddyde/types';
import {Grid} from '@mui/material';
import React from 'react';

import {useAuthContext} from '@/components/Auth';
import {useSnackbarContext} from '@/components/Snackbar';
import {useKeyPress} from '@/hooks';

import {DataDisclaimer} from './Disclaimer.component';
import {useFetchStockExchanges} from './Exchange';
import {SearchStockDialog, type TSearchStockDialogProps} from './SearchStockDialog.component';
import {StockService} from './Stock.service';
import {useFetchStockWatchlist, useStockWatchlistStore} from './Watchlist';

/**
 * Props for the StockLayout component.
 */
export type TStockLayoutProps = React.PropsWithChildren<
  Pick<TSearchStockDialogProps, 'onSelectAsset' | 'onOpenPosition'>
>;

/**
 * StockLayout component is responsible for rendering the layout for stocks.
 * It provides a dialog for searching and selecting stocks, and handles user interactions.
 *
 * @component
 * @example
 * return (
 *   <StockLayout
 *     onSelectAsset={handleSelectAsset}
 *     onOpenPosition={handleOpenPosition}
 *     onWatchlistInteraction={handleWatchlistInteraction}
 *   >
 *     {children}
 *   </StockLayout>
 * );
 */
export const StockLayout: React.FC<TStockLayoutProps> = ({onSelectAsset, onOpenPosition, children}) => {
  const {sessionUser} = useAuthContext();
  const {showSnackbar} = useSnackbarContext();
  const {set: setStockWatchlist} = useStockWatchlistStore();
  const {stockExchanges} = useFetchStockExchanges();
  const {loading: isLoadingWatchlist, assets: watchedAssets} = useFetchStockWatchlist();
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const [showStockDialog, setShowStockDialog] = React.useState(false);

  useKeyPress(
    ['k'],
    event => {
      event.preventDefault();
      setShowStockDialog(true);
    },
    dialogRef.current,
    true,
  );

  return (
    <React.Fragment>
      {children}
      <SearchStockDialog
        ref={dialogRef}
        open={showStockDialog}
        onClose={() => setShowStockDialog(false)}
        onSelectAsset={
          onSelectAsset
            ? asset => {
                setShowStockDialog(false);
                onSelectAsset(asset);
              }
            : undefined
        }
        onOpenPosition={
          onOpenPosition
            ? asset => {
                setShowStockDialog(false);
                onOpenPosition(asset);
              }
            : undefined
        }
        onWatchlistInteraction={async (event, asset) => {
          setShowStockDialog(false);
          if (!sessionUser || isLoadingWatchlist) return;

          if (event === 'ADD_TO_WATCHLIST') {
            try {
              const langSchwarzExchange = stockExchanges.find(exchange => exchange.symbol === 'LSX');
              if (!langSchwarzExchange) {
                throw new Error('Lang & Schwarz exchange not found');
              }

              const parsedPayload = ZAddWatchlistAssetPayload.safeParse({
                owner: sessionUser?.id,
                isin: asset.identifier,
                exchange: langSchwarzExchange.id,
              });
              if (!parsedPayload.success) throw parsedPayload.error;
              const [result, err] = await StockService.addAssetToWatchlist(parsedPayload.data);
              if (err) throw err;
              if (!result) throw new Error('Error adding asset to watchlist');
              setStockWatchlist(result);
              showSnackbar({message: 'Asset added to watchlist'});
            } catch (error) {
              console.error(error);
              showSnackbar({message: 'Error adding asset to watchlist'});
            }
          } else if (event === 'REMOVE_FROM_WATCHLIST') {
            try {
              const langSchwarzExchange = stockExchanges.find(exchange => exchange.symbol === 'LSX');
              if (!langSchwarzExchange) {
                throw new Error('Lang & Schwarz exchange not found');
              }

              const watchlistItem = watchedAssets.find(
                ({isin, exchange}) => isin === asset.identifier && exchange === langSchwarzExchange.id,
              );
              if (!watchlistItem) throw new Error("Asset isn't in watchlist");

              const parsedPayload = ZDeleteWatchlistAssetPayload.safeParse({id: watchlistItem.id});
              if (!parsedPayload.success) throw parsedPayload.error;
              const [result, err] = await StockService.deleteAssetFromWatchlist(parsedPayload.data);
              if (err) throw err;
              if (!result) throw new Error('Error removing asset from watchlist');
              setStockWatchlist(watchedAssets.filter(({id}) => id !== watchlistItem.id));
              showSnackbar({message: 'Asset removed from watchlist'});
            } catch (error) {
              console.error(error);
              showSnackbar({message: 'Error removing asset from watchlist'});
            }
          }
        }}
      />

      <Grid item xs={12}>
        <DataDisclaimer />
      </Grid>
    </React.Fragment>
  );
};
