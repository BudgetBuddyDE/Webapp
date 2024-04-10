import React from 'react';
import {format} from 'date-fns';
import {AddRounded, ArrowForwardRounded, DeleteRounded} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {Table} from '@/components/Base/Table';
import {ContentGrid} from '@/components/Layout';
import {withAuthLayout} from '@/components/Auth/Layout';
import {Box, Button, Chip, Grid, IconButton, TableCell, TableRow, Tooltip, Typography} from '@mui/material';
import {useSnackbarContext} from '@/components/Snackbar';
import {
  AddStockPositionDrawer,
  PortfolioDiversityChart,
  StockPrice,
  useFetchStockPositions,
  StockService,
  useStockStore,
} from '@/components/Stocks';
import {AppConfig} from '@/app.config';
import {getSocketIOClient} from '@/utils';
import {ActionPaper} from '@/components/Base';
import {SearchInput} from '@/components/Base/Search';
import {CircularProgress} from '@/components/Loading';
import {CreateEntityDrawerState, useEntityDrawer} from '@/hooks';
import {DeleteDialog} from '@/components/DeleteDialog.component';
import {useAuthContext} from '@/components/Auth';
import {type TCreateStockPositionPayload, type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {DownloadButton} from '@/components/Download';
import {Formatter} from '@/services';

interface IStocksHandler {
  onSearch: (keyword: string) => void;
  onAddPosition: () => void;
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
  const [showAddDrawer, dispatchAddDrawer] = React.useReducer(
    useEntityDrawer<TCreateStockPositionPayload>,
    CreateEntityDrawerState<TCreateStockPositionPayload>(),
  );
  const [keyword, setKeyword] = React.useState('');

  const displayedStockPositions = React.useMemo(() => {
    if (keyword === '') return stockPositions;
    const lowerKeyword = keyword.toLowerCase();
    return stockPositions.filter(
      position =>
        position.name.toLowerCase().includes(lowerKeyword) || position.isin.toLowerCase().includes(lowerKeyword),
    );
  }, [keyword, stockPositions]);

  const handler: IStocksHandler = {
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
    onSearch(keyword) {
      setKeyword(keyword);
    },
    onAddPosition() {
      dispatchAddDrawer({type: 'open'});
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
    <ContentGrid title="Stocks" description={'Manage your positions'}>
      <Grid item xs={12} md={9} lg={9} xl={9}>
        <Table<TStockPositionWithQuote>
          title="Positions"
          data={displayedStockPositions}
          headerCells={['Bought at', 'Name', 'Buy in', 'Price', 'Quantity', 'Value', 'Profit (+/-)', '']}
          renderRow={position => (
            <TableRow key={position.id}>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography>{format(new Date(position.bought_at), 'dd.MM.yy')}</Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: theme => theme.shape.borderRadius + 'px',
                    ':hover': {
                      backgroundColor: theme => theme.palette.action.hover,
                      cursor: 'Pointer',
                    },
                  }}
                  onClick={() => navigate('/stocks/' + position.isin)}>
                  <Box>
                    <Typography>{position.name}</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row'}}>
                      <Chip variant="outlined" size="small" sx={{mr: 1}} label={position.expand.exchange.symbol} />
                      <Chip
                        variant="outlined"
                        size="small"
                        sx={{mr: 1}}
                        label={position.isin}
                        onClick={async event => {
                          event.stopPropagation();
                          await navigator.clipboard.writeText(position.isin);
                          showSnackbar({message: 'Copied to clipboard'});
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography>{Formatter.formatBalance(position.buy_in, position.currency)}</Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Tooltip title={'As of ' + format(new Date(position.quote.datetime), 'dd.MM HH:mm:ss')}>
                  <StockPrice
                    price={position.quote.price}
                    currency={position.currency}
                    trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                  />
                </Tooltip>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <Typography>{position.quantity} x</Typography>
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <StockPrice
                  price={position.quantity * position.quote.price}
                  currency={position.currency}
                  trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                />
              </TableCell>
              <TableCell size={AppConfig.table.cellSize}>
                <StockPrice
                  price={(position.quote.price - position.buy_in) * position.quantity}
                  currency={position.currency}
                  trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                />
              </TableCell>
              <TableCell align="right" size={AppConfig.table.cellSize}>
                <ActionPaper sx={{display: 'flex', width: 'fit-content', ml: 'auto'}}>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setShowDeletePositionDialog(true);
                      setDeletePosition(position);
                    }}>
                    <DeleteRounded />
                  </IconButton>

                  <IconButton color="primary" onClick={() => navigate('/stocks/' + position.isin)}>
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
              {stockPositions.length > 0 && (
                <DownloadButton
                  data={stockPositions}
                  exportFileName={`bb_stock_positions_${format(new Date(), 'yyyy_mm_dd')}`}
                  exportFormat="JSON"
                  withTooltip>
                  Export
                </DownloadButton>
              )}
            </React.Fragment>
          }
        />
      </Grid>

      <Grid item xs={12} md={3}>
        {loadingStockPositions ? <CircularProgress /> : <PortfolioDiversityChart positions={stockPositions} />}
      </Grid>

      <DeleteDialog
        open={showDeletePositionDialog}
        onClose={handler.onCancelDeletePosition}
        onCancel={handler.onCancelDeletePosition}
        onConfirm={handler.onConfirmDeletePosition}
        withTransition
      />

      <AddStockPositionDrawer {...showAddDrawer} onClose={() => dispatchAddDrawer({type: 'close'})} />
    </ContentGrid>
  );
};

export default withAuthLayout(Stocks);
