import React from 'react';
import { Table } from '@/components/Base/Table';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  Box,
  Chip,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbarContext } from '@/core/Snackbar';
import { PortfolioDiversityChart } from '@/core/Stocks/PortfolioDiversityChart.component';
import {
  AddStockPositionDrawer,
  StockPrice,
  StockService,
  type TAddStockPositionDrawerPayload,
} from '@/core/Stocks';
import { type TStockPosition } from '@/core/Stocks/Stock.service';
import { AppConfig } from '@/app.config';
import { format } from 'date-fns';
import { formatBalance } from '@/utils';
import { AddRounded, ArrowForwardRounded } from '@mui/icons-material';
import { SearchInput } from '@/components/Base/Search';
import { useNavigate } from 'react-router-dom';
import { CreateEntityDrawerState, useEntityDrawer } from '@/hooks';
import { useAuthContext } from '@/core/Auth';
import { CircularProgress } from '@/components/Loading';

export type TParqetResponse<T> = {
  results: T[];
};

export type TAssetType = 'Security' | 'Crypto' | string;

export type TSearchResult = {
  name: string;
  assetType: string;
  assetId: {
    identifier: string;
    assetType: TAssetType;
  };
  asset: {
    _id: {
      identifier: string;
      assetType: TAssetType;
    };
    assetType: TAssetType;
    logo: string;
    name: string;
    security: {
      website: string;
      type: string;
      wkn: string;
      isin: string;
      etfDomicile: string;
      etfCompany: string;
    };
    popularityScore: number;
    score: number;
  };
  score: number;
  security: {
    wkn: string;
    isin: string;
    name: string;
    type: string;
    logo: string;
    website: string;
  };
};

interface IStocksHandler {
  onSearch: (keyword: string) => void;
  onAddPosition: () => void;
}

export const Stocks = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarContext();
  const { authOptions } = useAuthContext();
  const [loading, setLoading] = React.useState(true);
  const [positions, setPositions] = React.useState<TStockPosition[]>([]);

  const [showAddDrawer, dispatchAddDrawer] = React.useReducer(
    useEntityDrawer<TAddStockPositionDrawerPayload>,
    CreateEntityDrawerState<TAddStockPositionDrawerPayload>()
  );
  // const [keyword, setKeyword] = React.useState('');
  // const [searchResults, setSearchResults] = React.useState<TSearchResult[]>([]);

  const handler: IStocksHandler = {
    onSearch(keyword) {
      console.log(keyword);
    },
    onAddPosition() {
      dispatchAddDrawer({ type: 'open' });
    },
  };

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
    <ContentGrid title="Stocks" description={'Manage your positions'}>
      <Grid item xs={12} md={9} lg={9} xl={9}>
        <Table<TStockPosition>
          title="Positions"
          data={positions}
          headerCells={['Bought at', 'Name', 'Buy in', 'Price', 'Quantity', 'Value', 'Change', '']}
          renderHeaderCell={(headerCell) => (
            <TableCell
              key={headerCell.replaceAll(' ', '_').toLowerCase()}
              size={AppConfig.table.cellSize}
            >
              <Typography fontWeight="bolder">{headerCell}</Typography>
            </TableCell>
          )}
          renderRow={(position) => (
            <TableRow>
              <TableCell>
                <Typography>{format(new Date(position.bought_at), 'dd.MM.yy')}</Typography>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    borderRadius: (theme) => theme.shape.borderRadius + 'px',
                    ':hover': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                      cursor: 'Pointer',
                    },
                  }}
                  onClick={() => navigate('/stocks/' + position.isin)}
                >
                  <Typography>{position.name}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Chip
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      label={position.exchange.symbol}
                    />
                    <Chip
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      label={position.isin}
                      onClick={async (event) => {
                        event.stopPropagation();
                        await navigator.clipboard.writeText(position.isin);
                        showSnackbar({ message: 'Copied to clipboard' });
                      }}
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography>{formatBalance(position.buy_in, position.currency)}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip
                  title={'As of ' + format(new Date(position.quote.datetime), 'dd.MM HH:mm:ss')}
                >
                  <StockPrice
                    price={position.quote.price}
                    currency={position.currency}
                    trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                  />
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography>{position.quantity} x</Typography>
              </TableCell>
              <TableCell>
                <StockPrice
                  price={position.quantity * position.quote.price}
                  currency={position.currency}
                  trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                />
              </TableCell>
              <TableCell>
                <StockPrice
                  price={(position.quote.price - position.buy_in) * position.quantity}
                  currency={position.currency}
                  trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
                />
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => navigate('/stocks/' + position.isin)}>
                  <ArrowForwardRounded />
                </IconButton>
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

      <Grid item xs={12} md={3}>
        {loading ? (
          <CircularProgress />
        ) : (
          <PortfolioDiversityChart
            // data={[
            //   { label: 'Aktien', value: 10000 },
            //   { label: 'Anleihen', value: 20000 },
            //   { label: 'Fonds', value: 30000 },
            // ]}
            data={positions.map((position) => ({
              label: position.name,
              value: position.quantity * position.quote.price,
            }))}
          />
        )}
      </Grid>

      <AddStockPositionDrawer
        {...showAddDrawer}
        onClose={() => dispatchAddDrawer({ type: 'close' })}
      />
    </ContentGrid>
  );
};

export default withAuthLayout(Stocks);
