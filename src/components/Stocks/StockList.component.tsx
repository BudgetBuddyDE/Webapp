import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowForwardRounded } from '@mui/icons-material';
import { Box, Button, Chip, Link } from '@mui/material';
import { Card, ListWithIcon } from '@/components/Base';
import { type TStockPosition } from '@/components/Stocks';
import { StockPrice } from './index';
import { useSnackbarContext } from '../Snackbar';

export type TStockListProps = {
  title: string;
  subtitle?: string;
  data: TStockPosition[];
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
        {data.map((position) => (
          <ListWithIcon
            key={position.id}
            title={position.name}
            subtitle={
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
            }
            amount={
              <StockPrice
                price={position.quote.price}
                trend={position.quote.price >= position.buy_in ? 'up' : 'down'}
              />
            }
            imageUrl={position.logo}
            onClick={() => navigate('/stocks/' + position.isin)}
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
