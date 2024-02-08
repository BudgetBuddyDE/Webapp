import { Card, ListWithIcon } from '@/components/Base';
import { Box, Button, Chip, Link } from '@mui/material';
import React from 'react';
import { type TStockPosition } from '@/core/Stocks/Stock.service';
import { ArrowForwardRounded } from '@mui/icons-material';
import { StockPrice } from './index';
import { useSnackbarContext } from '../Snackbar';
import { useNavigate } from 'react-router';

export type TStockListProps = {
  title: string;
  subtitle?: string;
  data: Pick<TStockPosition, 'name' | 'logo' | 'quote' | 'isin' | 'exchange' | 'buy_in'>[];
};

export const StockList: React.FC<TStockListProps> = ({ title, subtitle, data }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarContext();
  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>
      </Card.Header>
      <Card.Body>
        {data.map((stock) => (
          <ListWithIcon
            key={stock.isin}
            title={stock.name}
            subtitle={
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Chip
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  label={stock.exchange.symbol}
                />
                <Chip
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  label={stock.isin}
                  onClick={async (event) => {
                    event.stopPropagation();
                    await navigator.clipboard.writeText(stock.isin);
                    showSnackbar({ message: 'Copied to clipboard' });
                  }}
                />
              </Box>
            }
            amount={
              <StockPrice
                price={stock.quote.price}
                trend={stock.quote.price >= stock.buy_in ? 'up' : 'down'}
              />
            }
            imageUrl={stock.logo}
            onClick={() => navigate('/stocks/' + stock.isin)}
          />
        ))}
      </Card.Body>
      <Card.Footer sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button endIcon={<ArrowForwardRounded />} LinkComponent={Link} href="/stocks">
          View all
        </Button>
      </Card.Footer>
    </Card>
  );
};
