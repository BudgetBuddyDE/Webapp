import React from 'react';
import { type TTimeframe } from '@budgetbuddyde/types';
import Chart from 'react-apexcharts';
import { ParentSize } from '@visx/responsive';
import { Box, useTheme } from '@mui/material';
import { Card } from '@/components/Base';
import { Timeframe } from './Timeframe.component';
import { formatBalance } from '@/utils';
import { useScreenSize } from '@/hooks';

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
  const screenSize = useScreenSize();

  return (
    <Card sx={{ p: 0 }}>
      <Card.Header sx={{ p: 2, pb: 0 }}>
        <Box>
          <Card.Title>Price</Card.Title>
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
      <Card.Body sx={{ px: 1, pb: 1 }}>
        <ParentSize>
          {({ width }) => (
            <Chart
              width={width}
              height={width * (screenSize !== 'small' ? 0.5 : 0.75)}
              type="area"
              options={{
                chart: {
                  type: 'area',
                  height: 350,
                  zoom: {
                    enabled: false,
                  },
                  toolbar: {
                    show: false,
                  },
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
                    opacityTo: 0,
                    stops: [0, 90, 100],
                  },
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
                  },
                },
                legend: {
                  horizontalAlign: 'left',
                },
                tooltip: {
                  theme: 'dark',
                  y: {
                    formatter(val) {
                      return formatBalance(val as number);
                    },
                  },
                },
              }}
              series={[
                {
                  name: 'Price',
                  data: data.map(({ date, price }) => [new Date(date).getTime(), price]),
                },
              ]}
            />
          )}
        </ParentSize>
      </Card.Body>
    </Card>
  );
};
