import {type TStockPositionWithQuote} from '@budgetbuddyde/types';
import {AddRounded, ArrowForwardRounded, FormatListBulletedRounded} from '@mui/icons-material';
import {Box, Button, Chip, IconButton, Link} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router';

import {Card, ListWithIcon, NoResults} from '@/components/Base';
import {useSnackbarContext} from '@/components/Snackbar';
import {Formatter} from '@/services/Formatter.service';

export type TStockListProps = {
  title: string;
  subtitle?: string;
  data: TStockPositionWithQuote[];
  onAddItem?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const StockList: React.FC<TStockListProps> = ({title, subtitle, data, onAddItem}) => {
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbarContext();
  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>

        {onAddItem && (
          <Card.HeaderActions>
            <IconButton size="small" onClick={onAddItem}>
              <AddRounded color="primary" />
            </IconButton>
          </Card.HeaderActions>
        )}
      </Card.Header>
      <Card.Body>
        {data.length > 0 ? (
          data.map(position => (
            <ListWithIcon
              key={position.id}
              title={position.name}
              subtitle={
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
              }
              amount={
                <Chip
                  color={position.quote.price >= position.buy_in ? 'success' : 'error'}
                  label={Formatter.formatBalance(position.quote.price)}
                />
              }
              imageUrl={position.logo}
              onClick={() => navigate('/stocks/' + position.isin)}
            />
          ))
        ) : (
          <NoResults icon={<FormatListBulletedRounded />} text="There arent any stocks" sx={{mt: 2}} />
        )}
      </Card.Body>
      {data.length > 0 && (
        <Card.Footer sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Button endIcon={<ArrowForwardRounded />} LinkComponent={Link} href="/stocks">
            View all
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};
