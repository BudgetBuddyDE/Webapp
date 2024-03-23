import React from 'react';
import { format } from 'date-fns';
import { ParentSize } from '@visx/responsive';
import { LineChart } from '@mui/x-charts';
import { Box, useTheme } from '@mui/material';
import { Card } from '@/components/Base';
import { type TTimeframe } from './types';
import { Timeframe } from './Timeframe.component';

export type TPriceChartPoint = {
  date: Date | string;
  price: number;
};

export type TPriceChartProps = {
  timeframe?: TTimeframe;
  onTimeframeChange?: (timeframe: TTimeframe) => void;
  data: TPriceChartPoint[];
};

export const PriceChart: React.FC<TPriceChartProps> = ({ onTimeframeChange, data }) => {
  const theme = useTheme();
  return (
    <Card>
      <Card.Header>
        <Box>
          <Card.Title>Preisentwicklung</Card.Title>
        </Box>

        <Card.HeaderActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {onTimeframeChange && <Timeframe onChange={onTimeframeChange} />}
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
                  data: data.map(({ date }) => new Date(date)),
                  scaleType: 'point',
                  valueFormatter: (date) => format(date, 'dd.MM'),
                },
              ]}
              series={[
                {
                  data: data.map((quote) => quote.price),
                  color: theme.palette.primary.main,
                  showMark: false,
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
