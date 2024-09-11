import {type TTimeframe} from '@budgetbuddyde/types';
import {Chip, Stack, Typography, useTheme} from '@mui/material';
import {LineChart} from '@mui/x-charts/LineChart';
import {format} from 'date-fns';
import React from 'react';

import {Card} from '@/components/Base';
import {AreaGradient} from '@/routes/Charts.route';
import {Formatter} from '@/services';

import {Timeframe} from './Timeframe.component';

export type TPriceChartPoint = {
  date: Date | string;
  price: number;
};

export type TPriceChartProps = {
  onTimeframeChange?: (timeframe: TTimeframe) => void;
  company: string;
  data: TPriceChartPoint[];
};

export const PriceChart: React.FC<TPriceChartProps> = ({company, onTimeframeChange, data}) => {
  const theme = useTheme();

  const increase: number = React.useMemo(() => {
    const first: number = data.at(0)?.price ?? 0;
    const last: number = data.at(-1)?.price ?? 0;
    return ((last - first) / first) * 100;
  }, [data]);

  return (
    <React.Fragment>
      <Card sx={{width: '100%'}}>
        <Card.Header>
          <Stack>
            <Card.Title>{company}</Card.Title>
            <Stack sx={{justifyContent: 'space-between'}}>
              <Stack
                direction="row"
                sx={{
                  alignContent: {xs: 'center', sm: 'flex-start'},
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography variant="h4" component="p">
                  {Formatter.formatBalance(data.at(-1)?.price ?? 0)}
                </Typography>
                <Chip size="small" color={'success'} label={`${increase > 0 ? '+' : ''} ${increase.toFixed(2)}%`} />
              </Stack>
            </Stack>
          </Stack>

          {onTimeframeChange && <Timeframe onChange={onTimeframeChange} />}
        </Card.Header>
        <Card.Body>
          <LineChart
            colors={[theme.palette.primary.main]}
            xAxis={[
              {
                scaleType: 'point',
                data: data.map(({date}) => format(new Date(date), 'MMM dd')),
                tickInterval: (_, i) => (i + 1) % 10 === 0,
              },
            ]}
            yAxis={[
              {
                id: 'price',
                valueFormatter: (value: string) => Formatter.formatBalance(Number(value)),
              },
            ]}
            series={[
              {
                id: 'price',
                label: company,
                showMark: false,
                curve: 'linear',
                stack: 'total',
                area: true,
                stackOrder: 'ascending',
                data: data.map(({price}) => price),
                valueFormatter: value => Formatter.formatBalance(value ?? 0),
              },
            ]}
            height={400}
            margin={{left: 60, right: 0, top: 20, bottom: 20}}
            grid={{horizontal: true}}
            sx={{
              '& .MuiAreaElement-series-price': {
                fill: "url('#price')",
              },
            }}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}>
            <AreaGradient color={theme.palette.primary.main} id="price" />
          </LineChart>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
