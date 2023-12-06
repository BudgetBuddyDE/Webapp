import React from 'react';
import { Tooltip } from '@mui/material';
import { alpha, hexToRgb, useTheme } from '@mui/material';
import { formatBalance } from '@/utils';
import { useScreenSize } from '@/hooks';
import Pie, { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { NoResults } from '../NoResults.component';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';

export type TPieChartData = {
  label: string;
  value: number;
};

export type TPieChartProps = {
  data: TPieChartData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  formatAsCurrency?: boolean;
  showTotalSum?: boolean;
};

function getAbsoluteAmount(data: TPieChartData) {
  return Math.abs(data.value);
}

function formatValue(amount: number, formatAsCurrency: boolean = false) {
  return formatAsCurrency ? formatBalance(amount) : amount;
}

function hasSpaceForLabel(
  screenSize: ReturnType<typeof useScreenSize>,
  arc: PieArcDatum<TPieChartData>
) {
  return screenSize === 'small'
    ? arc.endAngle - arc.startAngle >= 0.15
    : arc.endAngle - arc.startAngle >= 0.2;
}

export const PieChart: React.FC<TPieChartProps> = ({
  data,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  formatAsCurrency,
  showTotalSum = false,
}) => {
  // Hooks
  const theme = useTheme();
  const screenSize = useScreenSize();
  // Component variables
  const inner = React.useMemo(() => {
    return {
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  }, [width, height, margin]);
  const axis = React.useMemo(() => {
    return {
      y: inner.height / 2,
      x: inner.width / 2,
    };
  }, [inner]);
  const radius = React.useMemo(() => {
    return Math.min(inner.width, inner.height) / 2;
  }, [inner]);
  const donut_thickness = screenSize === 'small' ? 75 : 100;
  // Data driven variables
  const displayedData = React.useMemo(() => {
    return data.filter((entry) => entry.value !== 0);
  }, [data]);
  const category_names = Object.entries(displayedData).map(([_key, value]) => value.label);
  const color_range = displayedData.map((_expense, index) => {
    return displayedData.length > 1
      ? alpha(hexToRgb(theme.palette.primary.main), (1 / displayedData.length) * (index + 1))
      : alpha(hexToRgb(theme.palette.primary.main), 1);
  });
  const sum = displayedData.map(getAbsoluteAmount).reduce((prev, cur) => prev + cur, 0);
  const getCategoryColor = scaleOrdinal({
    domain: category_names,
    range: color_range,
  });

  if (displayedData.length === 0) {
    return <NoResults text="There is no data to display" />;
  }
  return (
    <svg width={width} height={width}>
      <Group top={axis.y + margin.top} left={axis.x + margin.left}>
        <Pie
          data={displayedData}
          pieValue={getAbsoluteAmount}
          outerRadius={radius}
          innerRadius={radius - donut_thickness}
          cornerRadius={4}
          padAngle={0.01}
        >
          {(pie) =>
            pie.arcs.map((arc, i: number) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              return (
                <React.Fragment key={`pie-arc-${i}`}>
                  <g>
                    <Tooltip
                      title={`${arc.data.label}: ${formatValue(
                        Math.abs(arc.data.value),
                        formatAsCurrency
                      )}`}
                    >
                      <path d={pie.path(arc) || ''} fill={getCategoryColor(arc.data.label)} />
                    </Tooltip>
                    {hasSpaceForLabel(screenSize, arc) && (
                      <g>
                        <text
                          fill="white"
                          x={centroidX}
                          y={centroidY - 13}
                          dy=".33em"
                          fontSize={screenSize === 'small' ? 12 : 15}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {arc.data.label}
                        </text>
                        <text
                          fill="white"
                          x={centroidX}
                          y={centroidY}
                          dy=".33em"
                          fontSize={screenSize === 'small' ? 12 : 15}
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {formatValue(Math.abs(arc.data.value), formatAsCurrency)}
                        </text>
                        <text
                          fill="white"
                          x={centroidX}
                          y={centroidY + 13}
                          dy=".33em"
                          fontSize={screenSize === 'small' ? 10 : 12}
                          textAnchor="middle"
                        >
                          {Math.abs((arc.data.value * 100) / sum).toFixed(2)} %
                        </text>
                      </g>
                    )}
                  </g>

                  {/* Total sum */}
                  {showTotalSum && (
                    <g>
                      <text
                        fill="white"
                        textAnchor="middle"
                        fontSize={screenSize === 'small' ? 20 : 28}
                      >
                        {formatValue(sum, formatAsCurrency)}
                      </text>
                    </g>
                  )}
                </React.Fragment>
              );
            })
          }
        </Pie>
      </Group>
    </svg>
  );
};
