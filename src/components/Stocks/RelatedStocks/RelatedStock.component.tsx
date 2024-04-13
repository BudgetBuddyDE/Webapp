import React from 'react';
import {Box, Skeleton, Typography, useTheme} from '@mui/material';
import {type TRelatedStockWithQuotes} from '@budgetbuddyde/types';
import Chart from 'react-apexcharts';
import {format} from 'date-fns';
import {ActionPaper, Card, Image} from '@/components/Base';
import {Formatter} from '@/services';
import {StockPrice} from '../StockPrice.component';
import {useNavigate} from 'react-router-dom';

export type TRelatedStockProps = {
  isLoading?: boolean;
  stock?: TRelatedStockWithQuotes;
};

export const RelatedStock: React.FC<TRelatedStockProps> = ({isLoading = false, stock}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  if (isLoading || !stock) {
    return (
      <Card sx={{p: 0}}>
        <Card.Header sx={{p: 1.5, justifyContent: 'unset'}}>
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="text" width={'60%'} sx={{ml: 1}} />
        </Card.Header>
        <Card.Body>
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{
              borderBottomLeftRadius: theme => theme.shape.borderRadius + 'px',
              borderBottomRightRadius: theme => theme.shape.borderRadius + 'px',
            }}
          />
        </Card.Body>
      </Card>
    );
  }

  const firstQuote = React.useMemo(() => {
    return stock.quotes[0];
  }, [stock]);

  const latestQuote = React.useMemo(() => {
    return stock.quotes[stock.quotes.length - 1];
  }, [stock]);

  return (
    <Card
      sx={{
        p: 0,
        ':hover': {
          cursor: 'pointer',
        },
      }}
      onClick={() => navigate('/stocks/' + stock.asset._id.identifier)}>
      <Card.Header sx={{p: 1.5}}>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            overflow: 'hidden',
          }}>
          <React.Fragment>
            <ActionPaper
              sx={{
                minWidth: '32px',
                width: '32px',
                height: '32px',
                mr: 1,
              }}>
              <Image src={stock.asset.logo} sx={{width: 'inherit', height: 'inherit'}} />
            </ActionPaper>
            <Typography
              className="teeeeest"
              sx={{
                transition: 'color .2s',
              }}
              variant="subtitle1"
              noWrap>
              {stock.asset.name}
            </Typography>
          </React.Fragment>

          <Box sx={{ml: 'auto'}}>
            <StockPrice
              price={latestQuote.price}
              currency={latestQuote.currency}
              trend={latestQuote.price > firstQuote.price ? 'up' : 'down'}
            />
          </Box>
        </Box>
      </Card.Header>
      <Card.Body>
        <Chart
          type="line"
          width={'100%'}
          height={40}
          options={{
            chart: {
              sparkline: {
                enabled: true,
              },
            },
            stroke: {
              width: 2,
              curve: 'smooth',
            },
            xaxis: {
              categories: stock.quotes.map(({date}) => format(date, 'dd.MM')),
            },
            tooltip: {
              theme: 'dark',
              y: {
                title: {
                  formatter() {
                    return '';
                  },
                },
                formatter(val) {
                  return Formatter.formatBalance(val, stock.quotes[0].currency);
                },
              },
            },
            colors: [theme.palette.primary.main],
          }}
          series={[{data: stock.quotes.map(({price}) => price)}]}
        />
      </Card.Body>
    </Card>
  );
};
