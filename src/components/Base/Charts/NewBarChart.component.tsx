import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { format } from 'date-fns';
import { type TBarChartData } from './BarChart.component';

export type TNewBarChartProps = {
  data: TBarChartData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  formatDate?: (dateString: string) => string;
  onSelectBar?: (data: TBarChartData | null) => void;
};

const DEFAULT_MARGIN = { top: 0, right: 0, bottom: 40, left: 0 };

const defaultDateFormatter = (dateString: string) => format(new Date(dateString), 'dd.MM.yyyy');

// FIXME: Replace current Barchart with this one and make BottomAxis optional
export const NewBarChart: React.FC<TNewBarChartProps> = ({
  data,
  width,
  height,
  margin = DEFAULT_MARGIN,
  formatDate = defaultDateFormatter,
  onSelectBar,
}) => {
  const theme = useTheme();

  const helper = {
    getDate(d: TBarChartData) {
      return d.label;
    },
    getValue(d: TBarChartData) {
      return d.value;
    },
    onMouseEnter(bar: TBarChartData) {
      if (!onSelectBar) return;
      onSelectBar(bar);
    },
    onMouseLeave() {
      if (!onSelectBar) return;
      onSelectBar(null);
    },
  };

  const innerWidth: number = useMemo(() => {
    return width - margin.left - margin.right;
  }, [width, margin]);

  const innerHeight: number = useMemo(() => {
    return height - margin.top / 1.5;
  }, [height, margin]);

  /**
   * Scale used for the x-axis for displaying the dates and providing the position of the bars/groups.
   */
  const xScale = useMemo(() => {
    return scaleBand<string>({
      range: [0, innerWidth],
      round: true,
      domain: data.map(helper.getDate),
      padding: 0.2,
    });
  }, [data, innerWidth]);

  /**
   * Scale used for the y-axis for displaying the values and providing the height of the bars.
   */
  const yScale = useMemo(() => {
    return scaleLinear<number>({
      range: [innerHeight - innerHeight * 0.1, margin.top],
      round: true,
      domain: [
        Math.min(...data.map(helper.getValue)) - 1,
        Math.max(...data.map(helper.getValue)) + 1,
      ],
    });
  }, [data, innerHeight, margin]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      <Group>
        {data.map((d) => {
          const xValue = helper.getDate(d);
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - (yScale(helper.getValue(d)) ?? 0);
          const barX = xScale(xValue);
          const barY = innerHeight - barHeight;

          return (
            <Bar
              key={`bar-${xValue}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={theme.palette.primary.main}
              rx={theme.shape.borderRadius * 0.5}
              onMouseEnter={() => helper.onMouseEnter(d)}
              onMouseLeave={() => helper.onMouseLeave()}
            />
          );
        })}
      </Group>

      <Group>
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          tickFormat={formatDate}
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
      </Group>
    </svg>
  );
};
