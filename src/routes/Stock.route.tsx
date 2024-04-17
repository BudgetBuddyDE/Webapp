import React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import {type TTimeframe} from '@budgetbuddyde/types';
import {ExpandMoreRounded, HelpOutlineRounded, TimelineRounded} from '@mui/icons-material';
import {Card, NoResults, TabPanel} from '@/components/Base';
import {ContentGrid} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {
  StockNews,
  StockService,
  EditStockPositionDrawer,
  AddStockPositionDrawer,
  CompanyInformation,
  DividendList,
  StockRating,
  PriceChart,
  useFetchStockPositions,
  useStockStore,
  useFetchStockQuotes,
  useFetchStockDetails,
  type TPriceChartPoint,
} from '@/components/Stocks';
import {getSocketIOClient} from '@/utils';
import {useAuthContext} from '@/components/Auth';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks/useEntityDrawer.reducer';
import {useSnackbarContext} from '@/components/Snackbar';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {CircularProgress} from '@/components/Loading';
import {
  type TCreateStockPositionPayload,
  type TStockPositionWithQuote,
  type TUpdateStockPositionPayload,
} from '@budgetbuddyde/types';
import {Formatter} from '@/services';
import {RelatedStock, useFetchRelatedStocks} from '@/components/Stocks/RelatedStocks';
import {StockPositionTable} from '@/components/Stocks/Position';

const NoStockMessage = () => (
  <Card>
    <NoResults icon={<HelpOutlineRounded />} text="No information found!" />
  </Card>
);

interface IStockHandler {
  onSearch: (term: string) => void;
  onAddPosition: () => void;
  onEditPosition: (position: TStockPositionWithQuote) => void;
  onCancelDeletePosition: () => void;
  onConfirmDeletePosition: () => void;
}

export const Stock = () => {
  const theme = useTheme();
  const params = useParams<{isin: string}>();
  const {showSnackbar} = useSnackbarContext();
  const {sessionUser} = useAuthContext();
  const {updateQuote} = useStockStore();
  const socket = getSocketIOClient();
  const [keyword, setKeyword] = React.useState('');
  const [chartTimeframe, setChartTimeframe] = React.useState<TTimeframe>('1m');
  const [tabPane, setTabPane] = React.useState({
    profit: 0,
    financial: 0,
  });
  const {loading: loadingDetails, details: stockDetails} = useFetchStockDetails(params.isin || '');
  const {
    loading: loadingQuotes,
    quotes,
    updateQuotes,
    refresh: refreshQuotes,
  } = useFetchStockQuotes([params.isin || ''], 'langschwarz', chartTimeframe);
  const {
    loading: loadingStockPositions,
    positions: stockPositions,
    refresh: refreshStockPositions,
  } = useFetchStockPositions();
  const {loading: loadingRelatedStocks, relatedStocks} = useFetchRelatedStocks(params.isin || '', 6);
  const [showAddDrawer, dispatchAddDrawer] = React.useReducer(
    useEntityDrawer<TCreateStockPositionPayload>,
    CreateEntityDrawerState<TCreateStockPositionPayload>(),
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TUpdateStockPositionPayload>,
    CreateEntityDrawerState<TUpdateStockPositionPayload>(),
  );
  const [showDeletePositionDialog, setShowDeletePositionDialog] = React.useState(false);
  const [deletePosition, setDeletePosition] = React.useState<TStockPositionWithQuote | null>(null);
  const chartOptions: Chart['props']['options'] = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: theme.palette.text.primary,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: theme.palette.action.disabled,
      strokeDashArray: 5,
    },
    yaxis: {
      forceNiceScale: true,
      opposite: true,
      labels: {
        style: {
          colors: theme.palette.text.primary,
        },
        formatter(val: number) {
          return Formatter.shortenNumber(val);
        },
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      labels: {
        colors: 'white',
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter(val: number) {
          return Formatter.formatBalance(val);
        },
      },
    },
  };

  const preparedChartData: TPriceChartPoint[] = React.useMemo(() => {
    if (!quotes) return [];
    return quotes[0].quotes.map(({date, price}) => ({price, date}));
  }, [quotes]);

  const displayedStockPositions = React.useMemo(() => {
    if (keyword === '') return stockPositions.filter(({isin}) => isin === params.isin);
    const lowerKeyword = keyword.toLowerCase();
    return stockPositions.filter(
      position =>
        (position.name.toLowerCase().includes(lowerKeyword) || position.isin.toLowerCase().includes(lowerKeyword)) &&
        position.isin === params.isin,
    );
  }, [keyword, stockPositions, params]);

  const handler: IStockHandler = {
    onSearch(term: string) {
      setKeyword(term);
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
    if (!params.isin || !sessionUser || loadingStockPositions || loadingQuotes || loadingDetails) return;
    socket.connect();

    socket.emit('stock:subscribe', [{isin: params.isin, exchange: 'langschwarz'}], sessionUser.id);

    socket.on(
      `stock:update:${sessionUser.id}`,
      (data: {exchange: string; isin: string; quote: {datetime: string; currency: string; price: number}}) => {
        console.log('stock:update', data);
        updateQuote(data.exchange, data.isin, data.quote.price);
        updateQuotes(prev => {
          if (!prev) return prev;
          const quotes = prev[0].quotes;
          const idx = prev[0].quotes.length - 1;
          prev[0].quotes[idx] = {...quotes[idx], price: data.quote.price};
          return prev;
        });
      },
    );

    return () => {
      socket.emit('stock:unsubscribe', [{isin: params.isin, exchange: 'langschwarz'}], sessionUser.id);
      socket.disconnect();
    };
  }, [params, sessionUser]);

  React.useEffect(() => {
    refreshQuotes();
  }, [chartTimeframe]);

  if (!params.isin || params.isin.length !== 12) return <Navigate to={'/stocks'} />;
  return (
    <ContentGrid title={stockDetails?.asset.name ?? ''} description={params.isin}>
      <Grid container item xs={12} md={12} lg={8} spacing={3}>
        <Grid item xs={12} md={12}>
          {loadingQuotes && (!quotes || quotes.length === 0) ? (
            <CircularProgress />
          ) : quotes ? (
            <PriceChart data={preparedChartData} timeframe={chartTimeframe} onTimeframeChange={setChartTimeframe} />
          ) : (
            <NoResults icon={<TimelineRounded />} text="No quotes found" />
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          <StockPositionTable
            isLoading={loadingStockPositions}
            positions={displayedStockPositions}
            onEditPosition={position => handler.onEditPosition(position)}
            onDeletePosition={position => {
              setShowDeletePositionDialog(true);
              setDeletePosition(position);
            }}
          />
        </Grid>

        {stockDetails && stockDetails.details.securityDetails && (
          <Grid item xs={12} md={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="subtitle1" fontWeight={'bold'}>
                  Profit & loss statements
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{px: 0}}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                  <Tabs
                    value={tabPane.profit}
                    onChange={(_, value) => setTabPane(prev => ({...prev, profit: value}))}
                    sx={{mx: 2}}>
                    <Tab label="Yearly" value={0} />
                    <Tab label="Quarterly" value={1} />
                  </Tabs>
                </Box>
                <TabPanel idx={0} value={tabPane.profit}>
                  <Chart
                    type="bar"
                    width={'100%'}
                    height={300}
                    options={{
                      ...chartOptions,
                      xaxis: {
                        ...chartOptions.xaxis,
                        categories: stockDetails?.details.securityDetails?.annualFinancials
                          .map(({date}) => date.getFullYear())
                          .reverse(),
                      },
                    }}
                    series={[
                      {
                        name: `Revenue (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials
                          .map(({revenue}) => revenue)
                          .reverse(),
                        color: theme.palette.success.main,
                      },
                      {
                        name: `Net Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials
                          .map(({netIncome}) => netIncome)
                          .reverse(),
                        color: theme.palette.warning.light,
                      },
                    ]}
                  />
                </TabPanel>
                <TabPanel idx={1} value={tabPane.profit}>
                  <Chart
                    type="bar"
                    width={'100%'}
                    height={300}
                    options={{
                      ...chartOptions,
                      xaxis: {
                        ...chartOptions.xaxis,
                        categories: stockDetails?.details.securityDetails?.quarterlyFinancials
                          .map(({date}) => `${Formatter.formatDate().shortMonthName(date)} ${date.getFullYear()}`)
                          .reverse(),
                      },
                    }}
                    series={[
                      {
                        name: `Revenue (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({revenue}) => revenue)
                          .reverse(),
                        color: theme.palette.success.main,
                      },
                      {
                        name: `Net Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({netIncome}) => netIncome)
                          .reverse(),
                        color: theme.palette.warning.light,
                      },
                    ]}
                  />
                </TabPanel>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="subtitle1" fontWeight={'bold'}>
                  Financial Statements
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{px: 0}}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                  <Tabs
                    value={tabPane.financial}
                    onChange={(_, value) => setTabPane(prev => ({...prev, financial: value}))}
                    sx={{mx: 2}}>
                    <Tab label="Yearly" value={0} />
                    <Tab label="Quarterly" value={1} />
                  </Tabs>
                </Box>
                <TabPanel idx={0} value={tabPane.financial}>
                  <Chart
                    type="bar"
                    width={'100%'}
                    height={300}
                    options={{
                      ...chartOptions,
                      xaxis: {
                        ...chartOptions.xaxis,
                        categories: stockDetails?.details.securityDetails?.annualFinancials
                          .map(({date}) => date.getFullYear())
                          .reverse(),
                      },
                    }}
                    series={[
                      {
                        name: `Revenue (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials
                          .map(({revenue}) => revenue)
                          .reverse(),
                        color: theme.palette.success.main,
                      },
                      {
                        name: `Gross Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials
                          .map(({grossProfit}) => grossProfit)
                          .reverse(),
                        color: theme.palette.primary.main,
                      },
                      {
                        name: `EBITDA (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials.map(({ebitda}) => ebitda).reverse(),
                        color: theme.palette.primary.light,
                      },
                      {
                        name: `Net Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.annualFinancials
                          .map(({netIncome}) => netIncome)
                          .reverse(),
                        color: theme.palette.warning.light,
                      },
                    ]}
                  />
                </TabPanel>
                <TabPanel idx={1} value={tabPane.financial}>
                  <Chart
                    type="bar"
                    width={'100%'}
                    height={300}
                    options={{
                      ...chartOptions,
                      xaxis: {
                        ...chartOptions.xaxis,
                        categories: stockDetails?.details.securityDetails?.quarterlyFinancials
                          .map(({date}) => `${Formatter.formatDate().shortMonthName(date)} ${date.getFullYear()}`)
                          .reverse(),
                      },
                    }}
                    series={[
                      {
                        name: `Revenue (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({revenue}) => revenue)
                          .reverse(),
                        color: theme.palette.success.main,
                      },
                      {
                        name: `Gross Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({grossProfit}) => grossProfit)
                          .reverse(),
                        color: theme.palette.primary.main,
                      },
                      {
                        name: `EBITDA (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({ebitda}) => ebitda)
                          .reverse(),
                        color: theme.palette.primary.light,
                      },
                      {
                        name: `Net Profit (${stockDetails.details.securityDetails.currency})`,
                        data: stockDetails.details.securityDetails.quarterlyFinancials
                          .map(({netIncome}) => netIncome)
                          .reverse(),
                        color: theme.palette.warning.light,
                      },
                    ]}
                  />
                </TabPanel>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        <Grid container item xs={12} md={12} spacing={2}>
          {loadingRelatedStocks
            ? Array.from({length: 6}).map((_, idx) => (
                <Grid key={idx} item xs={6} md={4}>
                  <RelatedStock isLoading />
                </Grid>
              ))
            : relatedStocks.map((stock, idx) => (
                <Grid key={idx} item xs={6} md={4}>
                  <RelatedStock key={stock.asset._id.identifier} stock={stock} />
                </Grid>
              ))}
        </Grid>
      </Grid>

      <Grid container item xs={12} md={12} lg={4} spacing={3}>
        <Grid item xs={12} md={12}>
          {loadingDetails ? (
            <CircularProgress />
          ) : stockDetails ? (
            <CompanyInformation details={stockDetails} />
          ) : (
            <NoStockMessage />
          )}
        </Grid>

        <Grid item xs={12} md={12}>
          {loadingDetails ? (
            <CircularProgress />
          ) : stockDetails ? (
            <DividendList dividends={stockDetails.details.futureDividends ?? []} />
          ) : (
            <NoStockMessage />
          )}
        </Grid>

        {stockDetails && (
          <Grid item xs={12} md={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography variant="subtitle1" fontWeight={'bold'}>
                  Company Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {stockDetails?.details.securityDetails?.description ?? 'No description available'}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {stockDetails && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                  <Typography variant="subtitle1" fontWeight={'bold'}>
                    Ratings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{p: 0}}>
                  <StockRating ratings={stockDetails.details.scorings} />
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
        )}

        <Grid item xs={12} md={12}>
          {loadingDetails ? (
            <CircularProgress />
          ) : stockDetails ? (
            <StockNews
              news={stockDetails.details.news.map(({title, description, url}) => ({
                heading: title,
                summary: description,
                link: url,
              }))}
            />
          ) : (
            <NoStockMessage />
          )}
        </Grid>
      </Grid>

      <AddStockPositionDrawer {...showAddDrawer} onClose={() => dispatchAddDrawer({type: 'close'})} />

      <EditStockPositionDrawer {...showEditDrawer} onClose={() => dispatchEditDrawer({type: 'close'})} />

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

export default withAuthLayout(Stock);
