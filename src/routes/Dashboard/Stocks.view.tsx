import React from 'react';
import { AccountBalanceRounded, TimelineRounded } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { StatsCard } from '@/components/StatsCard.component';
import { useAuthContext } from '@/components/Auth';
import { formatBalance, getSocketIOClient } from '@/utils';
import {
  StockList,
  StockNews,
  DividendTable,
  useFetchStockPositions,
  useStockStore,
  useFetchStockDividends,
  type TDividendDetails,
} from '@/components/Stocks';

export const StocksView = () => {
  const { updateQuote } = useStockStore();
  const { authOptions } = useAuthContext();
  const socket = getSocketIOClient(authOptions);
  const { loading: loadingStockPositions, positions: stockPositions } = useFetchStockPositions();
  const { loading: loadingDividends, dividends } = useFetchStockDividends(
    stockPositions.map(({ isin }) => isin)
  );

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
    return Object.entries(dividends).map(([_, dividendDetails]) => dividendDetails);
  }, [dividends]);

  React.useLayoutEffect(() => {
    const subscribedAssets: { isin: string; exchange: string }[] = [
      ...new Set(stockPositions.map(({ isin, exchange: { exchange } }) => ({ isin, exchange }))),
    ];

    socket.connect();

    socket.emit('stock:subscribe', subscribedAssets, authOptions.uuid);

    socket.on(
      `stock:update:${authOptions.uuid}`,
      (data: {
        exchange: string;
        isin: string;
        quote: { datetime: string; currency: string; price: number };
      }) => {
        console.log('stock:update', data);
        updateQuote(data.exchange, data.isin, data.quote.price);
      }
    );

    return () => {
      socket.emit('stock:unsubscribe', subscribedAssets, authOptions.uuid);
      socket.disconnect();
    };
  }, [authOptions.uuid, socket, stockPositions]);

  return (
    <React.Fragment>
      <Grid container item xs={12} md={8} spacing={3} sx={{ height: 'fit-content' }}>
        <Grid item xs={6} md={6} order={{ xs: 1, md: 1 }}>
          <StatsCard
            label={'Depot'}
            value={formatBalance(depotValue)}
            icon={<AccountBalanceRounded />}
            isLoading={loadingStockPositions}
            valueInformation="Current value of your depot"
          />
        </Grid>
        <Grid item xs={6} md={6} order={{ xs: 2, md: 3 }}>
          <StatsCard
            label={'Performance'}
            value={formatBalance(depotValue - depotBuyIn)}
            valueInformation="All-time performance"
            icon={<TimelineRounded />}
          />
        </Grid>

        <Grid item xs={12} md={12} order={{ xs: 4 }}>
          <DividendTable dividends={preparedDividends} isLoading={loadingDividends} />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        <Grid item xs={12}>
          <StockList
            title="Stocks"
            subtitle="How are your stocks performing?"
            data={stockPositions}
          />
        </Grid>

        <Grid item xs={12}>
          <StockNews news={[]} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default StocksView;
