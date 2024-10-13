import {type TDividendDetails} from '@budgetbuddyde/types';
import {AccountBalanceRounded, AddRounded, PaymentsRounded, RemoveRounded} from '@mui/icons-material';
import {Grid2 as Grid} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {AppConfig, Feature} from '@/app.config';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag/withFeatureFlag.component';
import {CircularProgress} from '@/components/Loading';
import {StatsCard} from '@/components/StatsCard/StatsCard.component';
import {useAuthContext} from '@/features/Auth';
import {MetalQuoteList} from '@/features/Metals';
import {
  DividendTable,
  PortfolioDiversityChart,
  StockLayout,
  StockWatchlist,
  useFetchStockDividends,
  useStockPositions,
  useStockWatchlist,
} from '@/features/Stocks';
import {StockPositionTable} from '@/features/Stocks/StockPosition';
import {useDocumentTitle} from '@/hooks/useDocumentTitle';
import {Formatter} from '@/services/Formatter';
import {getSocketIOClient} from '@/utils';

const StocksView = () => {
  useDocumentTitle(`${AppConfig.appName} - Stocks`, true);
  const navigate = useNavigate();
  const {sessionUser} = useAuthContext();
  const socket = getSocketIOClient();
  const {isLoading: isLoadingStockPositions, data: stockPositions, updateQuote} = useStockPositions();
  const {isLoading: isLoadingWatchlist, data: watchedAssets} = useStockWatchlist();
  const {
    loading: loadingDividends,
    dividends,
    refresh: refreshDividends,
  } = useFetchStockDividends((stockPositions ?? []).map(({isin}) => isin));

  const depotValue: number = React.useMemo(() => {
    if (!stockPositions) return 0;
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
    if (!stockPositions) return 0;
    return stockPositions
      .filter(position => position.buy_in < position.quote.price)
      .reduce((acc, position) => acc + (position.quote.price - position.buy_in) * position.quantity, 0);
  }, [stockPositions]);

  const unrealisedLosses: number = React.useMemo(() => {
    if (!stockPositions) return 0;
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
    if (!sessionUser || isLoadingStockPositions || !stockPositions || (stockPositions && stockPositions.length === 0))
      return;
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
  }, [sessionUser, socket, stockPositions, isLoadingStockPositions]);

  React.useEffect(() => {
    if (!isLoadingStockPositions && stockPositions && stockPositions.length > 0) {
      refreshDividends();
    }
  }, [isLoadingStockPositions, stockPositions]);

  return (
    <StockLayout onSelectAsset={({identifier}) => navigate(`/stocks/${identifier}`)}>
      <Grid container size={{xs: 12}} spacing={AppConfig.baseSpacing}>
        {[
          {
            label: 'Depot',
            value: Formatter.formatBalance(depotValue),
            icon: <AccountBalanceRounded />,
            isLoading: isLoadingStockPositions,
            valueInformation: 'Current value of your depot',
          },
          {
            label: 'Unrealised profits',
            value: Formatter.formatBalance(unrealisedProfits),
            icon: <AddRounded />,
            isLoading: isLoadingStockPositions,
            valueInformation: `Capital gain: ${Formatter.formatBalance(unrealisedProfits - unrealisedLosses)}`,
          },
          {
            label: 'Unrealised losses',
            value: Formatter.formatBalance(unrealisedLosses),
            icon: <RemoveRounded />,
            isLoading: isLoadingStockPositions,
            valueInformation: `Capital gain: ${Formatter.formatBalance(unrealisedProfits - unrealisedLosses)}`,
          },
          {
            label: 'Upcoming dividends',
            value: Formatter.formatBalance(upcomingDividends),
            icon: <PaymentsRounded />,
            isLoading: loadingDividends || isLoadingStockPositions,
            valueInformation: 'Expected upcoming dividend payments',
          },
        ].map(({value, valueInformation, icon, isLoading, label}) => (
          <Grid key={label.toLowerCase().replaceAll(' ', '_')} size={{xs: 6, md: 3}}>
            <StatsCard
              label={label}
              value={value}
              icon={icon}
              isLoading={isLoading}
              valueInformation={valueInformation}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container size={{xs: 12, md: 8}} spacing={AppConfig.baseSpacing} sx={{height: 'fit-content'}}>
        <Grid size={{xs: 12, md: 12}} order={{xs: 4}}>
          <StockPositionTable withRedirect />
        </Grid>

        <Grid size={{xs: 12}} order={{xs: 5}}>
          <DividendTable dividends={preparedDividends} isLoading={loadingDividends} withRedirect />
        </Grid>
      </Grid>

      <Grid container size={{xs: 12, md: 4}} spacing={AppConfig.baseSpacing}>
        <Grid size={{xs: 12}}>
          {isLoadingStockPositions ? (
            <CircularProgress />
          ) : (
            <PortfolioDiversityChart positions={stockPositions ?? []} />
          )}
        </Grid>

        <Grid size={{xs: 12}}>
          <MetalQuoteList />
        </Grid>

        <Grid size={{xs: 12}}>
          {isLoadingWatchlist ? (
            <CircularProgress />
          ) : (
            <StockWatchlist title="Watchlist" subtitle="Watched assets" data={watchedAssets ?? []} />
          )}
        </Grid>
      </Grid>
    </StockLayout>
  );
};

export default withFeatureFlag(Feature.STOCKS, StocksView);
