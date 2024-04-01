import React from 'react';
import {useTheme, alpha, hexToRgb} from '@mui/material';
import Chart, {type Props} from 'react-apexcharts';
import {formatBalance} from '@/utils';
import {type TPieChartData} from './index';

export type TApexPieChartProps = Omit<Props, 'series'> & {
  data: TPieChartData[];
};

export const ApexPieChart: React.FC<TApexPieChartProps> = ({data, ...props}) => {
  const theme = useTheme();
  return (
    <Chart
      type="donut"
      width={props.width}
      height={props.height}
      options={{
        chart: {
          type: 'pie',
        },
        legend: {
          show: false,
        },
        stroke: {
          width: 0,
        },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '50%',
              labels: {
                show: true,
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Total',
                  fontWeight: 'bolder',
                  color: theme.palette.text.primary,
                  formatter: () => {
                    return formatBalance(data.reduce((acc, {value}) => acc + value, 0));
                  },
                },
                value: {
                  offsetY: 0,
                  fontWeight: 'bolder',
                  color: theme.palette.text.primary,
                },
              },
            },
            dataLabels: {
              minAngleToShowLabel: 21,
            },
          },
        },
        labels: data.map(({label}) => label),

        dataLabels: {
          // @ts-ignore
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return [name as string, formatBalance(data[opts.seriesIndex].value), (val as number).toFixed(2) + '%'];
          },
        },
        colors:
          data.length === 1
            ? [theme.palette.primary.main]
            : data
                .map((_, idx, arr) => alpha(hexToRgb(theme.palette.primary.main), (1 / arr.length) * (idx + 1)))
                .reverse(),

        tooltip: {
          theme: 'dark',
          y: {
            formatter: val => formatBalance(val),
          },
        },
      }}
      series={data.sort((a, b) => b.value - a.value).map(({value}) => value)}
    />
  );
};
