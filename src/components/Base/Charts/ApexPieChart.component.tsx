import {alpha, hexToRgb, useTheme} from '@mui/material';
import React from 'react';
import Chart, {type Props} from 'react-apexcharts';

import {Formatter} from '@/services';

import {type TPieChartData} from './index';

export type TApexPieChartProps = Omit<Props, 'series'> & {
  data: TPieChartData[];
  formatAsCurrency?: boolean;
  showTotal?: boolean;
};

export const ApexPieChart: React.FC<TApexPieChartProps> = ({
  data,
  formatAsCurrency = false,
  showTotal = false,
  ...props
}) => {
  const theme = useTheme();

  const sortedChartData: TPieChartData[] = React.useMemo(() => {
    return data.sort((a, b) => b.value - a.value);
  }, [data]);

  const colorRange: string[] = React.useMemo(() => {
    return data.length === 1
      ? [theme.palette.primary.main]
      : data.map((_, idx, arr) => alpha(hexToRgb(theme.palette.primary.main), (1 / arr.length) * (idx + 1))).reverse();
  }, [sortedChartData]);

  const labels: string[] = React.useMemo(() => {
    return data.map(({label}) => label);
  }, [sortedChartData]);

  return (
    <Chart
      type="donut"
      width={props.width}
      height={props.height}
      options={{
        chart: {type: 'pie'},
        legend: {show: false},
        stroke: {width: 0},
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '50%',
              labels: {
                show: true,

                total: {
                  show: showTotal,
                  showAlways: showTotal,
                  label: 'Total',
                  fontWeight: 'bolder',
                  color: theme.palette.text.primary,
                  formatter: () => {
                    const sum: number = data.reduce((acc, {value}) => acc + value, 0);
                    return formatAsCurrency ? Formatter.formatBalance(sum) : sum.toFixed(2);
                  },
                },
                value: {
                  offsetY: 0,
                  fontWeight: 'bolder',
                  color: theme.palette.text.primary,
                },
              },
            },
            dataLabels: {minAngleToShowLabel: 21},
          },
        },
        labels: labels,
        dataLabels: {
          // @ts-ignore
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return formatAsCurrency
              ? [
                  name as string,
                  Formatter.formatBalance(data[opts.seriesIndex].value),
                  (val as number).toFixed(2) + '%',
                ]
              : [name as string, (val as number).toFixed(2) + '%'];
          },
        },
        colors: colorRange,
        tooltip: {
          theme: 'dark',
          y: formatAsCurrency ? {formatter: val => Formatter.formatBalance(val)} : {},
        },
      }}
      series={sortedChartData.map(({value}) => value)}
    />
  );
};
