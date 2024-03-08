import React from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { Tooltip, useTheme } from '@mui/material';
import { format, isSameYear } from 'date-fns';
import { type TMonthlyBalance } from '@budgetbuddyde/types';
import { DateService } from '@/services';
import { formatBalance } from '@/utils';

export type TMontlyBalanceChartProps = {
  data: TMonthlyBalance[];
  width: number;
  height: number;
  onSelectBarGroup?: (data: TMonthlyBalance | null) => void;
};

export const MonthlyBalanceChart: React.FC<TMontlyBalanceChartProps> = ({
  data,
  width,
  height,
  onSelectBarGroup,
}) => {
  const theme = useTheme();
  const [_, setSelectedBarGroup] = React.useState<TMonthlyBalance | null>(null);
  const VERTICAL_MARGIN = 60;

  const helper = {
    getDate(d: TMonthlyBalance) {
      return d.month.toString();
    },
    formatDate(date: Date | string) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return `${DateService.shortMonthName(dateObj)} ${
        isSameYear(dateObj, new Date()) ? '' : format(dateObj, 'yy')
      }`;
    },
    onMouseEnter(bar: TMonthlyBalance) {
      if (!onSelectBarGroup) return;
      setSelectedBarGroup(bar);
      onSelectBarGroup(bar);
    },
    onMouseLeave() {
      if (!onSelectBarGroup) return;
      setSelectedBarGroup(null);
      onSelectBarGroup(null);
    },
  };

  // const dataKeys = React.useMemo(() => {
  //   return Object.keys(data[0]).filter((d) => d !== 'date');
  // }, [data]);
  const dataKeys: (keyof TMonthlyBalance)[] = ['income', 'expenses'];

  const innerWidth: number = React.useMemo(() => {
    return width;
  }, [width]);

  const innerHeight: number = React.useMemo(() => {
    return height - VERTICAL_MARGIN / 1.75;
  }, [height]);

  const dateScale = React.useMemo(() => {
    return scaleBand<string>({
      range: [0, innerWidth],
      round: true,
      domain: data.map(helper.getDate),
      padding: 0.2,
    });
  }, [data, helper.getDate, innerWidth]);

  const cityScale = React.useMemo(() => {
    return scaleBand<string>({
      range: [0, dateScale.bandwidth()],
      round: true,
      domain: dataKeys,
      padding: 0.1,
    });
  }, [dataKeys, dateScale]);

  const valueScale = React.useMemo(() => {
    const min: number = Math.min(
      ...data.map((d) =>
        Math.min(...dataKeys.map((key) => Number(d[key as keyof TMonthlyBalance])))
      )
    );
    const max: number = Math.max(
      ...data.map((d) =>
        Math.max(...dataKeys.map((key) => Number(d[key as keyof TMonthlyBalance])))
      )
    );
    return scaleLinear<number>({
      range: [innerHeight, 0],
      domain: [min, max + max * 0.1],
    });
  }, [data, dataKeys, innerHeight]);

  const colorScale = React.useMemo(() => {
    return scaleOrdinal<string, string>({
      domain: dataKeys,
      range: [theme.palette.success.main, theme.palette.error.main],
    });
  }, [dataKeys]);

  if (width < 10) return null;
  return (
    <svg width={width} height={height}>
      <Group>
        <BarGroup
          data={data}
          keys={dataKeys}
          height={innerHeight}
          x0={helper.getDate}
          x0Scale={dateScale}
          x1Scale={cityScale}
          yScale={valueScale}
          color={colorScale}
        >
          {(barGroups) =>
            barGroups.map((barGroup) => (
              <Group
                key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                left={barGroup.x0}
                onMouseEnter={() => helper.onMouseEnter(data[barGroup.index])}
                onMouseLeave={() => helper.onMouseLeave()}
              >
                {barGroup.bars.map((bar, idx) => (
                  <Tooltip
                    title={`${idx === 0 ? 'Income' : 'Expenses'} ${formatBalance(bar.value)}`}
                    placement={'top'}
                  >
                    <rect
                      key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      rx={theme.shape.borderRadius * 0.5}
                      onMouseEnter={() => helper.onMouseEnter(data[barGroup.index])}
                      onMouseLeave={() => helper.onMouseLeave()}
                    />
                  </Tooltip>
                ))}
              </Group>
            ))
          }
        </BarGroup>
      </Group>
      <AxisBottom
        top={innerHeight}
        scale={dateScale}
        tickFormat={helper.formatDate}
        stroke={theme.palette.primary.main}
        strokeWidth={2}
        tickStroke={theme.palette.primary.main}
        hideAxisLine
        tickLabelProps={{
          fill: theme.palette.primary.main,
          fontSize: 13,
          fontWeight: 'bolder',
          textAnchor: 'middle',
        }}
      />
    </svg>
  );
};
