import React from 'react';
import {AccountBalanceRounded, TimelineRounded} from '@mui/icons-material';
import {Grid} from '@mui/material';
import {type TDividendDetails} from '@budgetbuddyde/types';
import {StatsCard} from '@/components/StatsCard.component';
import {useAuthContext} from '@/components/Auth';
import {getSocketIOClient} from '@/utils';
import {
  StockList,
  DividendTable,
  useFetchStockPositions,
  useStockStore,
  useFetchStockDividends,
  StockLayout,
} from '@/components/Stocks';
import {Formatter} from '@/services';
import {Feature} from '@/app.config';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag.component';
import {useNavigate} from 'react-router-dom';

const StocksView = () => {
  const navigate = useNavigate();
  const {updateQuote} = useStockStore();
  const {sessionUser} = useAuthContext();
  const socket = getSocketIOClient();
  const {loading: loadingStockPositions, positions: stockPositions} = useFetchStockPositions();
  const {
    loading: loadingDividends,
    dividends,
    refresh: refreshDividends,
  } = useFetchStockDividends(stockPositions.map(({isin}) => isin));

  const depotBuyIn: number = React.useMemo(() => {
    return stockPositions.reduce((acc, position) => {
      return acc + position.buy_in * position.quantity;
    }, 0);
  }, [stockPositions]);

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
      <Grid container item xs={12} md={8} spacing={3} sx={{height: 'fit-content'}}>
        <Grid item xs={6} md={6} order={{xs: 1, md: 1}}>
          <StatsCard
            label={'Depot'}
            value={Formatter.formatBalance(depotValue)}
            icon={<AccountBalanceRounded />}
            isLoading={loadingStockPositions}
            valueInformation="Current value of your depot"
          />
        </Grid>
        <Grid item xs={6} md={6} order={{xs: 2, md: 3}}>
          <StatsCard
            label={'Performance'}
            value={Formatter.formatBalance(depotValue - depotBuyIn)}
            valueInformation="All-time performance"
            icon={<TimelineRounded />}
          />
        </Grid>

        <Grid item xs={12} md={12} order={{xs: 4}}>
          <DividendTable dividends={preparedDividends} isLoading={loadingDividends} withRedirect />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        <Grid item xs={12}>
          <StockList title="Stocks" subtitle="How are your stocks performing?" data={stockPositions} />
        </Grid>
      </Grid>
    </StockLayout>
  );
};

export default withFeatureFlag(Feature.STOCKS, StocksView);
