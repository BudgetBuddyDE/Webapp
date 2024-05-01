import {type TTimeframe} from '@budgetbuddyde/types';
import {Box, useTheme} from '@mui/material';
import React from 'react';
import Chart from 'react-apexcharts';

import {Card} from '@/components/Base';
import {useScreenSize} from '@/hooks';
import {Formatter} from '@/services';

import {Timeframe} from './Timeframe.component';

export type TPriceChartPoint = {
  date: Date | string;
  price: number;
};

export type TPriceChartProps = {
  onTimeframeChange?: (timeframe: TTimeframe) => void;
  data: TPriceChartPoint[];
};

export const PriceChart: React.FC<TPriceChartProps> = ({onTimeframeChange, data}) => {
  const theme = useTheme();
  const screenSize = useScreenSize();

  return (
    <Card sx={{p: 0}}>
      <Card.Header sx={{p: 2, pb: 0}}>
        <Box>
          <Card.Title>Price</Card.Title>
        </Box>

        <Card.HeaderActions
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          {onTimeframeChange && <Timeframe onChange={onTimeframeChange} />}
        </Card.HeaderActions>
      </Card.Header>
      <Card.Body sx={{p: 0}}>
        <Chart
          width={'100%'}
          height={screenSize === 'small' ? 300 : 450}
          type="area"
          options={{
            chart: {
              type: 'area',
              zoom: {enabled: false},
              toolbar: {show: false},
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              width: 3,
              curve: 'smooth',
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.6,
                opacityTo: 0.1,
                stops: [0, 90, 100],
              },
            },
            grid: {
              borderColor: theme.palette.action.disabled,
              strokeDashArray: 5,
            },
            xaxis: {
              type: 'datetime',
              labels: {
                style: {
                  colors: theme.palette.text.primary,
                },
              },
            },
            yaxis: {
              opposite: true,
              labels: {
                style: {
                  colors: theme.palette.text.primary,
                },
                formatter(val: number) {
                  return Formatter.formatBalance(val);
                },
              },
            },
            tooltip: {
              theme: 'dark',
              y: {
                formatter(val) {
                  return Formatter.formatBalance(val as number);
                },
              },
            },
          }}
          series={[
            {
              name: 'Price',
              data: data.map(({date, price}) => [new Date(date).getTime(), price]),
            },
          ]}
        />
      </Card.Body>
    </Card>
  );
};
