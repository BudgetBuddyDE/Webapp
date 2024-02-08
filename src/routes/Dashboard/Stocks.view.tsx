import { StatsCard } from '@/components/StatsCard.component';
import { useAuthContext } from '@/core/Auth';
import { StockList, StockService } from '@/core/Stocks';
import { type TStockPosition } from '@/core/Stocks/Stock.service';
import { PriceChart } from '@/core/Stocks/PriceChart.component';
import { StockNews } from '@/core/Stocks/StockNews.component';
import { formatBalance } from '@/utils';
import { AccountBalanceRounded, TimelineRounded } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React from 'react';

export const StocksView = () => {
  const { authOptions } = useAuthContext();
  const [loading, setLoading] = React.useState(true);
  const [positions, setPositions] = React.useState<TStockPosition[]>([]);

  const depotBuyIn: number = React.useMemo(() => {
    return positions.reduce((acc, position) => {
      return acc + position.buy_in * position.quantity;
    }, 0);
  }, [positions]);

  const depotValue: number = React.useMemo(() => {
    return positions.reduce((acc, position) => {
      return acc + position.quote.price * position.quantity;
    }, 0);
  }, [positions]);

  const fetchStockPositions = async () => {
    setLoading(true);
    try {
      const [positions, error] = await StockService.getPositions(authOptions);
      if (error) throw error;
      if (!positions) return setPositions([]);
      setPositions(positions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    fetchStockPositions();
    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <React.Fragment>
      <Grid container item xs={12} md={8} spacing={3} sx={{ height: 'fit-content' }}>
        <Grid item xs={6} md={4} order={{ xs: 1, md: 1 }}>
          <StatsCard
            label={'Depot'}
            value={formatBalance(depotValue)}
            icon={<AccountBalanceRounded />}
            isLoading={loading}
          />
        </Grid>
        {/* <StatsCard
          label={'Depotdd'}
          value={formatBalance(34123.43)}
          valueInformation={`+ ${formatBalance(500.67)} in unrealised gains`}
          icon={<AccountBalanceRounded />}
        /> */}
        {/* <Grid item xs={12} md={4} order={{ xs: 3, md: 2 }}>

          <Card sx={{ p: 0 }}>
            <Card.Header sx={{ p: 2 }}>
              <Box>
                <Card.Title>Performance</Card.Title>
                <Card.Subtitle>How did the stock perform?</Card.Subtitle>
              </Box>

              <Box>
                <StockPrice
                  price={quotes[quotes.length - 1].price}
                  trend={quotes[quotes.length - 1].price - quotes[0].price > 0 ? 'up' : 'down'}
                />
              </Box>
            </Card.Header>
            <Card.Body>
              <SparkLineChart
                data={quotes.map((quote) => quote.price)}
                height={60}
                colors={[theme.palette.primary.main]}
                margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
                curve="catmullRom"
                showHighlight
                showTooltip
              />
            </Card.Body>
          </Card>
        </Grid> */}
        <Grid item xs={6} md={4} order={{ xs: 2, md: 3 }}>
          <StatsCard
            label={'Performance'}
            value={formatBalance(depotValue - depotBuyIn)}
            valueInformation="Year-to-Date Performance"
            icon={<TimelineRounded />}
          />
        </Grid>

        <Grid item xs={12} order={{ xs: 4 }}>
          <PriceChart />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        <Grid item xs={12}>
          <StockList
            title="Stocks"
            subtitle="How are your stocks performing?"
            data={positions.map(({ name, exchange, quote, buy_in, isin, logo }) => {
              return {
                name: name,
                logo: logo,
                exchange: exchange,
                buy_in: buy_in,
                quote: quote,
                isin: isin,
              };
            })}
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

{
  /* <Paper>
          <SparkLineChart
            data={Array.from({ length: 14 }).map(() => Math.random() * 100)}
            height={120}
            curve="catmullRom"
            area
            showHighlight
            showTooltip
          />
        </Paper> */
}

{
  /* <Card sx={{ p: 0 }}>
          <Card.Header></Card.Header>
          <Card.Body sx={{ p: 0 }}>
            <SparkLineChart
              data={Array.from({ length: 14 }).map(() => Math.random() * 100)}
              height={100}
              curve="catmullRom"
              area
              showHighlight
              showTooltip
            />
          </Card.Body>
        </Card> */
}
