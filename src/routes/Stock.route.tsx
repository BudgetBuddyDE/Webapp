import { Card, Linkify } from '@/components/Base';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Image } from '@/components/Base';
import { PriceChart, quotes } from '@/core/Stocks/PriceChart.component';
import { StockNews } from '@/core/Stocks/StockNews.component';
import { Table } from '@/components/Base/Table';
import { StockPrice, TStockPosition } from '@/core/Stocks';
import { AppConfig } from '@/app.config';
import { format } from 'date-fns';
import { formatBalance } from '@/utils';
import { SearchInput } from '@/components/Base/Search';
import { ArrowForwardRounded } from '@mui/icons-material';
import { type TSearchResult } from './Stocks.route';
import { SparkLineChart } from '@mui/x-charts';
import {
  EditStockPositionDrawer,
  type TEditStockPositionDrawerPayload,
} from '@/core/Stocks/EditStockPositionDrawer.component';
import { CreateEntityDrawerState, useEntityDrawer } from '@/hooks';
import { io } from 'socket.io-client';

const socket = io('ws://localhost:7070', {
  autoConnect: false,
});

interface IStockHandler {
  onSearch: (term: string) => void;
  onEditPosition: (position: TStockPosition) => void;
}

export const Stock = () => {
  const theme = useTheme();
  const params = useParams<{ isin: string }>();
  const [loading, setLoading] = React.useState(true);
  const [stock, setStock] = React.useState<TSearchResult | null>(null);
  const [showEditDrawer, dispatchEditDrawer] = React.useReducer(
    useEntityDrawer<TEditStockPositionDrawerPayload>,
    CreateEntityDrawerState<TEditStockPositionDrawerPayload>()
  );

  const handler: IStockHandler = {
    onSearch(term: string) {
      console.log('Search', term);
    },
    onEditPosition(position) {
      console.log(position);
      dispatchEditDrawer({ type: 'open', payload: position });
    },
  };

  const fetchStock = async (isin: string) => {
    try {
      const response = await fetch('https://api.parqet.com/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: isin,
          filter: {
            portfolioIds: [],
          },
        }),
      });
      const json = (await response.json()) as { results: TSearchResult[] };
      if (json.results.length > 0) {
        setStock(json.results[0]);
      } else setStock(null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setStock(null);
      setLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    if (!params.isin) return;
    fetchStock(params.isin);

    socket.connect();

    socket.emit('stock:subscribe', [{ isin: params.isin, exchange: 'langschwarz' }]);

    socket.on('hello', (...data) => console.log(data));

    socket.on('stock:update', (data) => {
      console.log('stock:update', data);
    });

    return () => {
      socket.emit('stock:unsubscribe', [{ isin: params.isin, exchange: 'langschwarz' }]);
      socket.disconnect();
      setLoading(true);
      setStock(null);
    };
  }, [params]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!loading && !stock) {
    return <div>Stock not found</div>;
  }
  return (
    <ContentGrid title={stock?.name ?? ''}>
      <Grid item xs={12} md={8}>
        <PriceChart />
      </Grid>

      <Grid container item xs={12} md={4} spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 0 }}>
            <Card.Header sx={{ p: 2, pb: 0 }}>
              <Box sx={{ display: 'flex' }}>
                <Image
                  src={stock?.asset.logo}
                  alt={'Stock Logo'}
                  sx={{
                    width: '40px',
                    height: '40px',
                    mr: 1,
                  }}
                />
                <Box>
                  <Card.Title>{stock?.name}</Card.Title>
                  <Card.Subtitle>Company information</Card.Subtitle>
                </Box>
              </Box>
            </Card.Header>
            <Card.Body>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={<Linkify>{stock?.security.type}</Linkify>}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Domicil"
                    secondary={<Linkify>{stock?.asset.security.etfDomicile}</Linkify>}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="ISIN"
                    secondary={<Linkify>{stock?.security.isin}</Linkify>}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="WKN"
                    secondary={<Linkify>{stock?.security.wkn}</Linkify>}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Website"
                    secondary={<Linkify>{stock?.security.website}</Linkify>}
                  />
                </ListItem>
              </List>
            </Card.Body>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <StockNews news={[]} />
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Table<TStockPosition>
          title="Positions"
          data={[
            {
              boughtAt: new Date(),
              name: 'Main Street Capital Corporation',
              symbol: '13M',
              isin: 'US56035L1044',
              exchange: {
                symbol: 'LSX',
                exchange: 'langschwarz',
                label: 'Lang & Schwarz AG',
                country: 'DE',
              },
              currency: 'EUR',
              buyIn: 39.56,
              quote: {
                currency: 'EUR',
                exchange: 'langschwarz',
                date: new Date('2024-02-09'),
                datetime: new Date('2024-02-09T11:17:42.000Z'),
                price: 41.44,
                isin: 'US56035L1044',
                cachedAt: new Date('2024-02-09T11:17:43.211Z'),
              },
              amount: 180,
            },
            {
              boughtAt: new Date(),
              name: 'Main Street Capital Corporation',
              symbol: '13M',
              isin: 'US56035L1044',
              exchange: {
                symbol: 'LSX',
                exchange: 'langschwarz',
                label: 'Lang & Schwarz AG',
                country: 'DE',
              },
              currency: 'USD',
              buyIn: 42.0,
              quote: {
                currency: 'USD',
                exchange: 'langschwarz',
                date: new Date('2024-02-09'),
                datetime: new Date('2024-02-09T11:17:42.000Z'),
                price: 41.44,
                isin: 'US56035L1044',
                cachedAt: new Date('2024-02-09T11:17:43.211Z'),
              },
              amount: 180,
            },
          ]}
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
              <TableCell>{format(position.boughtAt, 'dd.MM.yy')}</TableCell>
              <TableCell>
                <Chip
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  label={position.exchange.label}
                />
              </TableCell>
              <TableCell>
                <Typography>{formatBalance(position.buyIn, position.currency)}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={'As of ' + format(position.quote.datetime, 'dd.MM HH:mm:ss')}>
                  <StockPrice price={position.quote.price} currency={position.currency} />
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography>{position.amount} x</Typography>
              </TableCell>
              <TableCell>
                <StockPrice
                  price={position.amount * position.quote.price}
                  currency={position.currency}
                />
              </TableCell>
              <TableCell>
                <StockPrice
                  price={(position.quote.price - position.buyIn) * position.amount}
                  currency={position.currency}
                />
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handler.onEditPosition(position)}>
                  <ArrowForwardRounded />
                </IconButton>
              </TableCell>
            </TableRow>
          )}
          tableActions={
            <React.Fragment>
              <SearchInput placeholder="Search position" onSearch={handler.onSearch} />
              {/* <IconButton color="primary" onClick={handler.onAddPosition}>
                <AddRounded fontSize="inherit" />
              </IconButton> */}
            </React.Fragment>
          }
        />
      </Grid>

      <Grid item xs={4}>
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
              height={100}
              colors={[theme.palette.primary.main]}
              margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
              curve="catmullRom"
              showHighlight
              showTooltip
            />
          </Card.Body>
        </Card>
      </Grid>

      <EditStockPositionDrawer
        {...showEditDrawer}
        onClose={() => dispatchEditDrawer({ type: 'close' })}
      />
    </ContentGrid>
  );
};

export default withAuthLayout(Stock);
