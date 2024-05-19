import {type TDividendDetails} from '@budgetbuddyde/types';
import {AccountBalanceRounded, AddRounded, PaymentsRounded, RemoveRounded} from '@mui/icons-material';
import {Grid} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {Feature} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag.component';
import {CircularProgress} from '@/components/Loading';
import {StatsCard} from '@/components/StatsCard.component';
import {
  DividendTable,
  StockLayout,
  StockWatchlist,
  useFetchStockDividends,
  useFetchStockPositions,
  useFetchStockWatchlist,
  useStockStore,
} from '@/components/Stocks';
import {StockPositionTable} from '@/components/Stocks/Position';
import {Formatter} from '@/services';
import {getSocketIOClient} from '@/utils';

const StocksView = () => {
  const navigate = useNavigate();
  const {updateQuote} = useStockStore();
  const {sessionUser} = useAuthContext();
  const socket = getSocketIOClient();
  const {loading: loadingStockPositions, positions: stockPositions} = useFetchStockPositions();
  const {loading: isLoadingWatchlist, assets: watchedAssets} = useFetchStockWatchlist();
  const {
    loading: loadingDividends,
    dividends,
    refresh: refreshDividends,
  } = useFetchStockDividends(stockPositions.map(({isin}) => isin));

  const depotValue: number = React.useMemo(() => {
    return stockPositions.reduce((acc, position) => {
      return acc + position.quote.price * position.quantity;
    }, 0);
  }, [stockPositions]);

  const preparedDividends: TDividendDetails[] = React.useMemo(() => {
    if (!dividends) return [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return Object.entries(dividends).map(([_, dividendDetails]) => dividendDetails);
  }, [dividends]);

  const unrealisedProfits: number = React.useMemo(() => {
    return stockPositions
      .filter(position => position.buy_in < position.quote.price)
      .reduce((acc, position) => acc + (position.quote.price - position.buy_in) * position.quantity, 0);
  }, [stockPositions]);

  const unrealisedLosses: number = React.useMemo(() => {
    return stockPositions
      .filter(position => position.buy_in > position.quote.price)
      .reduce((acc, position) => acc + Math.abs(position.quote.price - position.buy_in) * position.quantity, 0);
  }, [stockPositions]);

  const upcomingDividends: number = React.useMemo(() => {
    if (!dividends || !stockPositions || stockPositions.length === 0) return 0;
    return Object.entries(dividends)
      .flatMap(([_, dividendDetails]) => dividendDetails.futureDividends)
      .reduce((acc, dividend) => {
        if (!dividend) return acc;
        const matchingPositions = stockPositions.filter(({isin}) => isin === dividend.security);
        const totalStockQuantity = matchingPositions.reduce((acc, position) => acc + position.quantity, 0);
        if (totalStockQuantity <= 0) return acc;
        return acc + totalStockQuantity * dividend.price;
      }, 0);
  }, [dividends, stockPositions]);

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

  React.useEffect(() => {
    if (!loadingStockPositions && stockPositions.length > 0) {
      refreshDividends();
    }
  }, [loadingStockPositions, stockPositions]);

  return (
    <StockLayout onSelectAsset={({identifier}) => navigate(`/stocks/${identifier}`)}>
      <Grid container item xs={12} md={12} spacing={3}>
        <Grid item xs={6} md={3}>
          <StatsCard
            label={'Depot'}
            value={Formatter.formatBalance(depotValue)}
            icon={<AccountBalanceRounded />}
            isLoading={loadingStockPositions}
            valueInformation="Current value of your depot"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            label="Unrealised profits"
            value={Formatter.formatBalance(unrealisedProfits)}
            icon={<AddRounded />}
            isLoading={loadingStockPositions}
            valueInformation={`Capital gain: ${Formatter.formatBalance(unrealisedProfits - unrealisedLosses)}`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            label="Unrealised profits"
            value={Formatter.formatBalance(unrealisedLosses)}
            icon={<RemoveRounded />}
            isLoading={loadingStockPositions}
            valueInformation={`Capital gain: ${Formatter.formatBalance(unrealisedProfits - unrealisedLosses)}`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            label="Upcoming dividends"
            value={Formatter.formatBalance(upcomingDividends)}
            icon={<PaymentsRounded />}
            isLoading={loadingDividends || loadingStockPositions}
            valueInformation="Expected upcoming dividend payments"
          />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={8} spacing={3} sx={{height: 'fit-content'}}>
        <Grid item xs={12} md={12} order={{xs: 4}}>
          <StockPositionTable withRedirect />
        </Grid>

        <Grid item xs={12} md={12} order={{xs: 5}}>
          <DividendTable dividends={preparedDividends} isLoading={loadingDividends} withRedirect />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        <Grid item xs={12}>
          {isLoadingWatchlist ? (
            <CircularProgress />
          ) : (
            <StockWatchlist title="Watchlist" subtitle="Watched assets" data={watchedAssets} />
          )}
        </Grid>
      </Grid>
    </StockLayout>
  );
};

export default withFeatureFlag(Feature.STOCKS, StocksView);
