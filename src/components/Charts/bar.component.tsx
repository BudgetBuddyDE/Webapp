import { alpha, useTheme } from '@mui/material';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import React from 'react';

export interface BarChartData {
  label: string;
  value: number;
}

export interface BarChartProps {
  width: number;
  height: number;
  events?: boolean;
  onEvent?: (data: BarChartData | null) => void;
  data: BarChartData[];
}

export const VERTICAL_MARGIN = 18;

function getLabel(d: BarChartData) {
  return d.label;
}

function getValue(d: BarChartData) {
  return d.value * 100;
}

export const BarChart: React.FC<BarChartProps> = ({
  width,
  height,
  events = true,
  onEvent,
  data,
}) => {
  const theme = useTheme();
  const [selectedBar, setSelectedBar] = React.useState<BarChartData | null>(null);
  const xMax = width;
  const yMax = height - VERTICAL_MARGIN;

  const xScale = React.useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: data.map(getLabel),
        padding: 0.4,
      }),
    [xMax, data]
  );
  const yScale = React.useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(getValue))],
      }),
    [yMax, data]
  );

  const handler: {
    bar: {
      onMouseEnter: (bar: BarChartData) => void;
      onMouseLeave: () => void;
    };
  } = {
    bar: {
      onMouseEnter(bar) {
        if (events) {
          setSelectedBar(bar);
          if (onEvent) onEvent(bar);
        }
      },
      onMouseLeave() {
        if (events) {
          setSelectedBar(null);
          if (onEvent) onEvent(null);
        }
      },
    },
  };

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Group top={VERTICAL_MARGIN / 2}>
        {data.map((d) => {
          const label = getLabel(d);
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(getValue(d)) ?? 0);
          const barX = xScale(label);
          const barY = yMax - barHeight;
          const fillColor =
            selectedBar !== null
              ? selectedBar.label === label
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.4)
              : theme.palette.primary.main;

          return (
            <Bar
              key={`bar-${label}`}
              x={barX}
              y={barY}
              style={{ transition: 'all 500ms' }}
              width={barWidth}
              height={barHeight}
              fill={fillColor}
              // onClick={() => {
              //   if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
              // }}
              onMouseEnter={() => handler.bar.onMouseEnter(d)}
              onMouseLeave={() => handler.bar.onMouseLeave()}
            />
          );
        })}
      </Group>
    </svg>
  );
};
