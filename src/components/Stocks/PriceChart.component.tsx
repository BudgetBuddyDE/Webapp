import {type TTimeframe} from '@budgetbuddyde/types';
import {Chip, Stack, Typography, useTheme} from '@mui/material';
import {format, isSameYear} from 'date-fns';
import React from 'react';

import {Card} from '@/components/Base';
import {Formatter} from '@/services';

import {AreaGradient, LineChart} from '../Base/Charts/LineChart.component';
import {Timeframe} from './Timeframe.component';

export type TPriceChartPoint = {
  date: Date | string;
  price: number;
};

export type TPriceChartProps = {
  onTimeframeChange?: (timeframe: TTimeframe) => void;
  data: TPriceChartPoint[];
  company: {name: string};
};

export const PriceChart: React.FC<TPriceChartProps> = ({onTimeframeChange, company, data}) => {
  const theme = useTheme();

  const oldestPrice = data.at(-1)!.price;
  const latestPrice = data.at(0)!.price;

  return (
    <Card>
      <Card.Header actions={onTimeframeChange && <Timeframe onChange={onTimeframeChange} />}>
        <Stack>
          <Typography variant="h6">{company.name}</Typography>
          <Stack sx={{justifyContent: 'space-between'}}>
            <Stack
              direction="row"
              sx={{
                alignContent: {xs: 'center', sm: 'flex-start'},
                alignItems: 'center',
                gap: 1,
              }}>
              <Typography variant="h4" component="p">
                {Formatter.formatBalance(latestPrice)}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={oldestPrice > latestPrice ? 'success' : 'error'}
                label={`${Formatter.formatBalance(oldestPrice - latestPrice)}`}
              />
            </Stack>
            <Typography variant="caption" sx={{color: 'text.secondary'}}>
              Stock price per day for {company.name}
            </Typography>
          </Stack>
        </Stack>
      </Card.Header>
      <Card.Body>
        <LineChart
          colors={[theme.palette.primary.main]}
          xAxis={[
            {
              scaleType: 'point',
              data: data.map(({date}) => format(new Date(date), 'yyyy-MM-dd')),
              valueFormatter: (value: string) => {
                const d = new Date(value);
                return isSameYear(new Date(), d) ? format(d, 'MMM dd') : format(d, 'MMM dd, yy');
              },
              tickInterval: (_, i) => (i + 1) % Math.ceil(data.length / (data.length * 0.2)) === 0,
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
              label: company.name,
              showMark: false,
              curve: 'catmullRom',
              stack: 'total',
              area: true,
              data: data.map(({price}) => price),
              valueFormatter: value => Formatter.formatBalance(value ?? 0),
              baseline: 'min',
            },
          ]}
          height={400}
          margin={{left: 60, right: 0, top: 20, bottom: 30}}
          grid={{horizontal: true}}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 2.5,
            },
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
  );
};
