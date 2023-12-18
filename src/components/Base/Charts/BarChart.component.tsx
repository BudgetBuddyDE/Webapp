import React from 'react';
import { alpha, useTheme } from '@mui/material';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';

export type TBarChartData = {
  label: string;
  value: number;
};

export type TBarChartProps = {
  width: number;
  height: number;
  events?: boolean;
  onEvent?: (data: TBarChartData | null) => void;
  data: TBarChartData[];
};

export const VERTICAL_MARGIN = 18;

function getLabel(d: TBarChartData) {
  return d.label;
}

function getValue(d: TBarChartData) {
  return d.value * 100;
}

export const BarChart: React.FC<TBarChartProps> = ({
  width,
  height,
  events = true,
  onEvent,
  data,
}) => {
  const theme = useTheme();
  const [selectedBar, setSelectedBar] = React.useState<TBarChartData | null>(null);
  const xMax = width;
  const yMax = height - VERTICAL_MARGIN;

  /**
   * Scale used for the x-axis for displaying the dates and providing the position of the bars/groups.
   */
  const xScale = React.useMemo(() => {
    return scaleBand<string>({
      range: [0, xMax],
      round: true,
      domain: data.map(getLabel),
      padding: 0.4,
    });
  }, [xMax, data]);

  /**
   * Scale used for the y-axis for displaying the values and providing the height of the bars.
   */
  const yScale = React.useMemo(() => {
    return scaleLinear<number>({
      range: [yMax - 15, 0],
      round: true,
      domain: [0, Math.max(...data.map(getValue))],
    });
  }, [yMax, data]);

  const handler: {
    bar: {
      onMouseEnter: (bar: TBarChartData) => void;
      onMouseLeave: () => void;
    };
  } = {
    bar: {
      onMouseEnter(bar) {
        if (!events) return;
        setSelectedBar(bar);
        if (onEvent) onEvent(bar);
      },
      onMouseLeave() {
        if (!events) setSelectedBar(null);
        if (onEvent) onEvent(null);
      },
    },
  };

  if (width < 10) return null;
  return (
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
              onMouseEnter={() => handler.bar.onMouseEnter(d)}
              onMouseLeave={() => handler.bar.onMouseLeave()}
            />
          );
        })}
      </Group>
    </svg>
  );
};
