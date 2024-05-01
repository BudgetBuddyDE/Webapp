import {type TTimeframe} from '@budgetbuddyde/types';
import {type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {ExpandMoreRounded, HelpOutlineRounded, TimelineRounded} from '@mui/icons-material';
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
import React from 'react';
import Chart from 'react-apexcharts';
import {Navigate, useNavigate, useParams} from 'react-router-dom';

import {Feature} from '@/app.config';
import {useAuthContext} from '@/components/Auth';
import {withAuthLayout} from '@/components/Auth/Layout';
import {Card, NoResults, TabPanel} from '@/components/Base';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {UseEntityDrawerDefaultState, useEntityDrawer} from '@/components/Drawer/EntityDrawer';
import {withFeatureFlag} from '@/components/Feature/withFeatureFlag.component';
import {ContentGrid} from '@/components/Layout';
import {CircularProgress} from '@/components/Loading';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  CompanyInformation,
  DividendList,
  PriceChart,
  StockLayout,
  StockNews,
  StockRating,
  StockService,
  type TPriceChartPoint,
  useFetchStockDetails,
  useFetchStockPositions,
  useFetchStockQuotes,
  useStockStore,
} from '@/components/Stocks';
import {StockPositionTable} from '@/components/Stocks/Position';
import {RelatedStock, useFetchRelatedStocks} from '@/components/Stocks/RelatedStocks';
import {StockPositionDrawer, type TStockPositionDrawerValues} from '@/components/Stocks/StockPositionDrawer.component';
import {Formatter} from '@/services';
import {getSocketIOClient} from '@/utils';

const NoStockMessage = () => (
  <Card>
    <NoResults icon={<HelpOutlineRounded />} text="No information found!" />
  </Card>
);

interface IStockHandler {
  showCreateDialog: (payload?: Partial<TStockPositionDrawerValues>) => void;
  showEditDialog: (stockPosition: TStockPositionWithQuote) => void;
  onSearch: (term: string) => void;
  onCancelDeletePosition: () => void;
  onConfirmDeletePosition: () => void;
}

export const Stock = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams<{isin: string}>();
  const {showSnackbar} = useSnackbarContext();
  const {sessionUser} = useAuthContext();
  const {updateQuote} = useStockStore();
  const socket = getSocketIOClient();
  const [keyword, setKeyword] = React.useState('');
  const [chartTimeframe, setChartTimeframe] = React.useState<TTimeframe>('3m');
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
  const [stockPositionDrawer, dispatchStockPositionDrawer] = React.useReducer(
    useEntityDrawer<TStockPositionDrawerValues>,
    UseEntityDrawerDefaultState<TStockPositionDrawerValues>(),
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
    showCreateDialog(payload) {
      dispatchStockPositionDrawer({
        type: 'OPEN',
        drawerAction: 'CREATE',
        payload: payload
          ? payload
          : stockDetails
            ? {
                stock: {
                  type: stockDetails.asset.assetType,
                  isin: stockDetails.asset._id.identifier,
                  label: stockDetails.asset.name ?? '',
                  logo: stockDetails.asset.logo,
                },
              }
            : undefined,
      });
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
    <StockLayout
      onSelectAsset={({identifier}) => navigate(`/stocks/${identifier}`)}
      onOpenPosition={({name, logo, identifier, type}) => {
        handler.showCreateDialog({stock: {type, isin: identifier, label: name, logo}});
      }}>
      <ContentGrid title={stockDetails?.asset.name ?? ''} description={params.isin}>
        <Grid container item xs={12} md={12} lg={8} spacing={3}>
          <Grid item xs={12} md={12}>
            {loadingQuotes && (!quotes || quotes.length === 0) ? (
              <CircularProgress />
            ) : quotes ? (
              <PriceChart data={preparedChartData} onTimeframeChange={setChartTimeframe} />
            ) : (
              <NoResults icon={<TimelineRounded />} text="No quotes found" />
            )}
          </Grid>

          <Grid item xs={12} md={12}>
            <StockPositionTable
              isLoading={loadingStockPositions}
              positions={displayedStockPositions}
              onAddPosition={handler.showCreateDialog}
              onEditPosition={handler.showEditDialog}
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
                          data: stockDetails.details.securityDetails.annualFinancials
                            .map(({ebitda}) => ebitda)
                            .reverse(),
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

export default withFeatureFlag(Feature.STOCKS, withAuthLayout(Stock), true);
