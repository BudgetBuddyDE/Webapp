import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Chip,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddRounded, ArrowForwardRounded, DeleteRounded } from '@mui/icons-material';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { ActionPaper } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/components/Auth/Layout';
import { PriceChart, type TPriceChartPoint } from '@/components/Stocks/PriceChart.component';
import { Table } from '@/components/Base/Table';
import {
  StockNews,
  StockPrice,
  StockService,
  useFetchStockPositions,
  EditStockPositionDrawer,
  AddStockPositionDrawer,
  CompanyInformation,
  DividendList,
  useStockStore,
  type TAssetSearchResult,
  type TStockPosition,
  type TAssetChartQuote,
  type TUpdatePositionPayload,
  type TOpenPositionPayload,
  type TTimeframe,
  type TDividendDetails,
} from '@/components/Stocks';
import { formatBalance } from '@/utils';
import { SearchInput } from '@/components/Base/Search';
import { useAuthContext } from '@/components/Auth';
import { CreateEntityDrawerState, useEntityDrawer } from '@/hooks/useEntityDrawer.reducer';
import { useSnackbarContext } from '@/components/Snackbar';
import { DeleteDialog } from '@/components/DeleteDialog.component';

interface IStockHandler {
  onSearch: (term: string) => void;
  onAddPosition: () => void;
  onEditPosition: (position: TStockPosition) => void;
  onCancelDeletePosition: () => void;
  onConfirmDeletePosition: () => void;
}

export const Stock = () => {
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const socket = io('ws://' + process.env.STOCK_SERVICE_HOST!.split('//')[1], {
    autoConnect: false,
    auth: {
      token: `Bearer ${authOptions.uuid}.${authOptions.password}`,
    },
  });
  const {
    loading: loadingStockPositions,
    positions: stockPositions,
    refresh: refreshStockPositions,
  } = useFetchStockPositions();
  const { updateQuote } = useStockStore();
  const params = useParams<{ isin: string }>();
  const [loading, setLoading] = React.useState(true);
  const [stock, setStock] = React.useState<TAssetSearchResult | null>(null);
  const [keyword, setKeyword] = React.useState('');
  const [quotes, setQuotes] = React.useState<TAssetChartQuote | null>(null);
  const [chartTimeframe, setChartTimeframe] = React.useState<TTimeframe>('1m');
  const [showAddDrawer, dispatchAddDrawer] = React.useReducer(
    useEntityDrawer<TOpenPositionPayload>,
    CreateEntityDrawerState<TOpenPositionPayload>()
  );
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TUpdatePositionPayload>,
    CreateEntityDrawerState<TUpdatePositionPayload>()
  );
  const [showDeletePositionDialog, setShowDeletePositionDialog] = React.useState(false);
  const [deletePosition, setDeletePosition] = React.useState<TStockPosition | null>(null);
  const [dividends, setDividends] = React.useState<TDividendDetails[]>([]);

  const displayedStockPositions = React.useMemo(() => {
    if (keyword === '') return stockPositions.filter(({ isin }) => isin === params.isin);
    const lowerKeyword = keyword.toLowerCase();
    return stockPositions.filter(
      (position) =>
        (position.name.toLowerCase().includes(lowerKeyword) ||
          position.isin.toLowerCase().includes(lowerKeyword)) &&
        position.isin === params.isin
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
      if (!deletePosition) return;

      const [position, error] = await StockService.deletePosition(
        [{ id: deletePosition.id }],
        authOptions
      );
      if (error) {
        showSnackbar({
          message: error.message,
          action: <Button onClick={() => handler.onConfirmDeletePosition()}>Retry</Button>,
        });
        console.error(error);
        return;
      }
      if (!position || position.length === 0) {
        showSnackbar({
          message: 'Error deleting position',
          action: <Button onClick={() => handler.onConfirmDeletePosition()}>Retry</Button>,
        });
        return;
      }

      showSnackbar({ message: 'Position deleted' });
      setShowDeletePositionDialog(false);
      setDeletePosition(null);
      React.startTransition(() => {
        refreshStockPositions();
      });
    },
    onAddPosition() {
      dispatchAddDrawer({ type: 'open' });
    },
    onEditPosition({ bought_at, buy_in, exchange, id, isin, quantity }) {
      dispatchEditDrawer({
        type: 'open',
        payload: {
          bought_at: bought_at,
          buy_in: buy_in,
          exchange: exchange.symbol,
          id: id,
          isin: isin,
          quantity: quantity,
        },
      });
    },
  };

  const chartData: TPriceChartPoint[] = React.useMemo(() => {
    if (!quotes) return [];
    return quotes.quotes.map(({ date, price }) => ({ price, date }));
  }, [quotes]);

  const fetchStock = async (isin: string) => {
    setLoading(true);
    const [result, error] = await StockService.searchAsset(isin, authOptions);
    if (error) {
      console.error(error);
      setStock(null);
      setLoading(false);
      return;
    }

    if (!result || result.length === 0) {
      setStock(null);
      setLoading(false);
      return;
    }

    setStock(result![0]);
    setLoading(false);
  };

  const fetchStockDividends = React.useCallback(async () => {
    if (!params.isin) return;
    setLoading(true);
    const [dividends, error] = await StockService.getDividends([params.isin], authOptions);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    if (!dividends) return setLoading(false);
    setDividends(Object.entries(dividends).map(([_, dividendDetails]) => dividendDetails));
    setLoading(false);
  }, [stockPositions]);

  React.useLayoutEffect(() => {
    fetchStockDividends();
    return () => {
      setLoading(false);
    };
  }, [params.isin]);

  const fetchQuotes = async (isin: string, exchange: string, timeframe: TTimeframe) => {
    const [result, error] = await StockService.getQuotes([isin], exchange, timeframe, authOptions);
    if (error) {
      console.error(error);
      setQuotes(null);
      return;
    }

    if (!result || result.length === 0) {
      setQuotes(null);
      return;
    }

    setQuotes(result[0]);
  };

  React.useLayoutEffect(() => {
    if (!params.isin) return;
    fetchQuotes(params.isin, 'langschwarz', chartTimeframe);

    return () => {
      setQuotes(null);
    };
  }, [params, chartTimeframe]);

  React.useLayoutEffect(() => {
    if (!params.isin) return;
    fetchStock(params.isin);

    socket.connect();

    socket.emit(
      'stock:subscribe',
      [{ isin: params.isin, exchange: 'langschwarz' }],
      authOptions.uuid
    );

    socket.on(
      `stock:update:${authOptions.uuid}`,
      (data: {
        exchange: string;
        isin: string;
        quote: { datetime: string; currency: string; price: number };
      }) => {
        console.log('stock:update', data);
        updateQuote(data.exchange, data.isin, data.quote.price);
        setQuotes((prev) => {
          if (!prev) return prev;
          const quotes = prev.quotes;
          const idx = prev.quotes.length - 1;
          prev.quotes[idx] = { ...quotes[idx], price: data.quote.price };
          return prev;
        });
      }
    );

    return () => {
      socket.emit(
        'stock:unsubscribe',
        [{ isin: params.isin, exchange: 'langschwarz' }],
        authOptions.uuid
      );
      socket.disconnect();
      setLoading(true);
      setStock(null);
    };
  }, [params, authOptions]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!loading && !stock) {
    return <div>Stock not found</div>;
  }
  return (
    <ContentGrid title={stock?.name ?? ''} description={params.isin}>
      <Grid container item xs={12} md={8} spacing={3}>
        <Grid item xs={12} md={12}>
          <PriceChart data={chartData} onTimeframeChange={setChartTimeframe} />
        </Grid>

        <Grid item xs={12} md={12}>
          <Table<TStockPosition>
            isLoading={loadingStockPositions}
            title="Positions"
            data={displayedStockPositions}
            headerCells={[
              'Bought at',
              'Exchange',
              'Buy in',
              'Price',
              'Quantity',
              'Value',
              'Profit',
              '',
            ]}
            renderRow={(position) => (
              <TableRow key={position.id}>
                <TableCell>{format(position.bought_at, 'dd.MM.yy')}</TableCell>
                <TableCell>
                  <Chip
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    label={position.exchange.symbol}
                  />
                </TableCell>
                <TableCell>
                  <Typography>{formatBalance(position.buy_in, position.currency)}</Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={'As of ' + format(position.quote.datetime, 'dd.MM HH:mm:ss')}>
                    <StockPrice price={position.quote.price} currency={position.currency} />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography>{position.quantity} x</Typography>
                </TableCell>
                <TableCell>
                  <StockPrice
                    price={position.quantity * position.quote.price}
                    currency={position.currency}
                  />
                </TableCell>
                <TableCell>
                  <StockPrice
                    price={(position.quote.price - position.buy_in) * position.quantity}
                    currency={position.currency}
                  />
                </TableCell>
                <TableCell>
                  <ActionPaper sx={{ display: 'flex', width: 'fit-content', ml: 'auto' }}>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setShowDeletePositionDialog(true);
                        setDeletePosition(position);
                      }}
                    >
                      <DeleteRounded />
                    </IconButton>

                    <IconButton color="primary" onClick={() => handler.onEditPosition(position)}>
                      <ArrowForwardRounded />
                    </IconButton>
                  </ActionPaper>
                </TableCell>
              </TableRow>
            )}
            tableActions={
              <React.Fragment>
                <SearchInput placeholder="Search position" onSearch={handler.onSearch} />
                <IconButton color="primary" onClick={handler.onAddPosition}>
                  <AddRounded fontSize="inherit" />
                </IconButton>
              </React.Fragment>
            }
          />
        </Grid>
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        {stock && (
          <Grid item xs={12} md={12}>
            <CompanyInformation
              name={stock.name}
              identifier={stock.identifier}
              logo={stock.logo}
              type={stock.type}
              domicile={stock.domicile}
              wkn={stock.wkn}
              website={stock.website}
            />
          </Grid>
        )}

        <Grid item xs={12} md={12}>
          <StockNews news={[]} />
        </Grid>

        <Grid item xs={12} md={12}>
          <DividendList dividends={dividends} />
        </Grid>
      </Grid>

      <AddStockPositionDrawer
        {...showAddDrawer}
        onClose={() => dispatchAddDrawer({ type: 'close' })}
      />

      <EditStockPositionDrawer
        {...showEditDrawer}
        onClose={() => dispatchEditDrawer({ type: 'close' })}
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

export default withAuthLayout(Stock);
