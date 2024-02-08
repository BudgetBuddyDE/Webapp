import { Card } from '@/components/Base';
import { Box, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { ParentSize } from '@visx/responsive';
import { format } from 'date-fns';
import React from 'react';

export const quotes = [
  {
    date: '2024-01-09',
    price: 39.94,
  },
  {
    date: '2024-01-10',
    price: 39.99,
  },
  {
    date: '2024-01-11',
    price: 39.73,
  },
  {
    date: '2024-01-12',
    price: 39.94,
  },
  {
    date: '2024-01-15',
    price: 40.14,
  },
  {
    date: '2024-01-16',
    price: 40.15,
  },
  {
    date: '2024-01-17',
    price: 40.12,
  },
  {
    date: '2024-01-18',
    price: 40.13,
  },
  {
    date: '2024-01-19',
    price: 40.55,
  },
  {
    date: '2024-01-22',
    price: 40.9,
  },
  {
    date: '2024-01-23',
    price: 41.64,
  },
  {
    date: '2024-01-24',
    price: 41.81,
  },
  // {
  //   date: '2024-01-24',
  //   price: -1.81,
  // },
  {
    date: '2024-01-25',
    price: 42.02,
  },
  {
    date: '2024-01-26',
    price: 42.11,
  },
  {
    date: '2024-01-29',
    price: 42.01,
  },
  {
    date: '2024-01-30',
    price: 42.35,
  },
  {
    date: '2024-01-31',
    price: 42.22,
  },
  {
    date: '2024-02-01',
    price: 41.21,
  },
  {
    date: '2024-02-02',
    price: 41.34,
  },
  {
    date: '2024-02-05',
    price: 41.98,
  },
  {
    date: '2024-02-06',
    price: 42.07,
  },
  {
    date: '2024-02-07',
    price: 41.82,
  },
  {
    date: '2024-02-08',
    price: 41.39,
  },
  {
    date: '2024-02-09',
    price: 41.66,
  },
];

export type TTimeframe = '1W' | '1M' | '3M' | '1Y' | '5Y';

export type TPriceChartProps = {
  timeframe?: TTimeframe;
};

export const PriceChart: React.FC<TPriceChartProps> = ({ timeframe = '1M' }) => {
  const theme = useTheme();
  const [currentTimeframe, setCurrentTimeframe] = React.useState<TTimeframe>(timeframe);

  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Vermögensentwicklung</Card.Title>
          <Card.Subtitle>dasdsas</Card.Subtitle>
        </Box>

        <Card.HeaderActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={currentTimeframe}
            onChange={(event: React.BaseSyntheticEvent) => setCurrentTimeframe(event.target.value)}
            exclusive
          >
            {['1W', '1M', '3M', '1Y', '5Y'].map((timeframe) => (
              <ToggleButton key={timeframe} value={timeframe}>
                {timeframe}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body>
        <ParentSize>
          {({ width }) => (
            <LineChart
              margin={{ right: 16 }}
              xAxis={[
                {
                  id: 'Days',
                  data: quotes.map(({ date }) => new Date(date)),
                  scaleType: 'point',
                  valueFormatter: (date) => format(date, 'dd.MM'),
                },
              ]}
              series={[
                {
                  data: quotes.map((quote) => quote.price),
                  color: theme.palette.primary.main,
                },
              ]}
              width={width}
              height={500}
            />
          )}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};
