import { Tooltip } from '@mui/material';
import { alpha, hexToRgb, useTheme } from '@mui/material';
import { Group } from '@visx/group';
import { scaleOrdinal } from '@visx/scale';
import { Pie } from '@visx/shape';
import { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import React from 'react';
import { useScreenSize } from '../../hooks';
import { formatBalance } from '../../utils';

export type PieChartData = {
  label: string;
  value: number;
};

export interface PieChartProps {
  data: PieChartData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  formatAsCurrency?: boolean;
  showTotalSum?: boolean;
}

function getAbsoluteAmount(data: PieChartData) {
  return Math.abs(data.value);
}

function formatValue(amount: number, formatAsCurrency: boolean = false) {
  return formatAsCurrency ? formatBalance(amount) : amount;
}

function hasSpaceForLabel(screenSize: ReturnType<typeof useScreenSize>, arc: PieArcDatum<PieChartData>) {
  return screenSize === 'small' ? arc.endAngle - arc.startAngle >= 0.15 : arc.endAngle - arc.startAngle >= 0.2;
}

export const PieChart: React.FC<PieChartProps> = ({
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
  const category_names = Object.entries(data).map(([key, value]) => value.label);
  const color_range = data.map((expense, index) => {
    return data.length > 1
      ? alpha(hexToRgb(theme.palette.primary.main), (1 / data.length) * (index + 1))
      : alpha(hexToRgb(theme.palette.primary.main), 1);
  });
  const sum = data.map(getAbsoluteAmount).reduce((prev, cur) => prev + cur, 0);
  const getCategoryColor = scaleOrdinal({
    domain: category_names,
    range: color_range,
  });

  return (
    <svg width={width} height={width}>
      <Group top={axis.y + margin.top} left={axis.x + margin.left}>
        <Pie
          data={data}
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
                    <Tooltip title={`${arc.data.label}: ${formatValue(Math.abs(arc.data.value), formatAsCurrency)}`}>
                      <path d={pie.path(arc) || ''} fill={getCategoryColor(arc.data.label)} />
                    </Tooltip>
                    {/* Arc label */}
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
                      <text fill="white" textAnchor="middle" fontSize={screenSize === 'small' ? 20 : 28}>
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
