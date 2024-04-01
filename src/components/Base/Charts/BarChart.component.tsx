import {useState, useMemo} from 'react';
import {alpha, useTheme} from '@mui/material';
import {Bar} from '@visx/shape';
import {scaleBand, scaleLinear} from '@visx/scale';
import {AxisBottom} from '@visx/axis';
import {Group} from '@visx/group';
import {format} from 'date-fns';
export type TBarChartData = {
  label: string;
  value: number;
};

export type TBarChartProps = {
  data: TBarChartData[];
  width: number;
  height: number;
  formatDate?: (dateString: string) => string;
  onSelectBar?: (data: TBarChartData | null) => void;
};

const defaultDateFormatter = (dateString: string) => format(new Date(dateString), 'dd.MM.yyyy');

export const BarChart: React.FC<TBarChartProps> = ({
  data,
  width,
  height,
  formatDate = defaultDateFormatter,
  onSelectBar,
}) => {
  const theme = useTheme();
  const [selectedBar, setSelectedBar] = useState<TBarChartData | null>(null);

  const VERTICAL_MARGIN = 60;

  const helper = {
    getDate(d: TBarChartData) {
      return d.label;
    },
    getValue(d: TBarChartData) {
      return d.value;
    },
    onMouseEnter(bar: TBarChartData) {
      if (!onSelectBar) return;
      setSelectedBar(bar);
      onSelectBar(bar);
    },
    onMouseLeave() {
      if (!onSelectBar) return;
      setSelectedBar(null);
      onSelectBar(null);
    },
  };

  const innerWidth: number = useMemo(() => {
    return width;
  }, [width]);

  const innerHeight: number = useMemo(() => {
    return height - VERTICAL_MARGIN / 1.75;
  }, [height]);

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
      range: [innerHeight - innerHeight * 0.1, VERTICAL_MARGIN],
      round: true,
      domain: [Math.min(...data.map(helper.getValue)) - 1, Math.max(...data.map(helper.getValue)) + 1],
    });
  }, [data, innerHeight]);

  if (width < 10) return null;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      <Group>
        {data.map(d => {
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
              fill={
                selectedBar !== null && selectedBar.label === xValue
                  ? alpha(theme.palette.primary.main, 0.8)
                  : theme.palette.primary.main
              }
              rx={theme.shape.borderRadius * 0.5}
              style={{transition: 'all 0.2s ease-in-out'}}
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
