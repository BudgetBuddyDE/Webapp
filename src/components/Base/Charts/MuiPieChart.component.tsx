import React from 'react';
import { alpha, hexToRgb, useTheme } from '@mui/material';
import { PieChart, type PieValueType, type PieChartProps } from '@mui/x-charts';
import { type MakeOptional } from '@mui/x-date-pickers/internals/models/helpers';
import { PieCenterLabel } from './PieCenterLabel.component';
import { formatBalance } from '@/utils';

export type TMuiChartData = MakeOptional<PieValueType, 'id'>[];

export type TMuiChartProps = Omit<PieChartProps, 'series'> & {
  data: TMuiChartData;
  formatAsCurrency?: boolean;
  showTotalSum?: boolean;
};

export const MuiPieChart: React.FC<TMuiChartProps> = ({
  data,
  formatAsCurrency = false,
  showTotalSum = false,
  ...props
}) => {
  const theme = useTheme();

  const sum = React.useMemo(() => {
    return data.reduce((acc, { value }) => acc + value, 0);
  }, [data]);

  const colorRange: string[] = React.useMemo(() => {
    return data
      .map((_, idx, arr) => {
        return data.length > 1
          ? alpha(hexToRgb(theme.palette.primary.main), (1 / arr.length) * (idx + 1))
          : alpha(hexToRgb(theme.palette.primary.main), 1);
      })
      .reverse();
  }, [data]);

  const formatNumber = React.useCallback(
    (num: number) => {
      return formatAsCurrency ? formatBalance(num) : num;
    },
    [formatAsCurrency]
  );

  return (
    <PieChart
      colors={colorRange}
      series={[
        {
          type: 'pie',
          data: data,
          color: theme.palette.primary.main,
          innerRadius: 90,
          cornerRadius: 5,
          arcLabel: (item) => `${item.label}`,
          arcLabelMinAngle: 10,
          paddingAngle: 0.25,
          sortingValues: (a, b) => b - a,
          valueFormatter: ({ value }) => formatBalance(value),
        },
      ]}
      margin={{ right: 0 }}
      slotProps={{ legend: { hidden: true } }}
      {...props}
    >
      {showTotalSum && <PieCenterLabel>{formatNumber(sum)}</PieCenterLabel>}
    </PieChart>
  );
};
