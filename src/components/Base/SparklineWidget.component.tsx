import React from 'react';
import Card from './Card.component';
import { Box, CardProps, useTheme } from '@mui/material';
import {
  AxisConfig,
  CardinalDirections,
  ChartsAxisHighlightProps,
  ChartsTooltipProps,
  LineSeriesType,
  ResponsiveChartContainerProps,
  SparkLineChart,
} from '@mui/x-charts';
import {
  SparkLineChartSlotComponentProps,
  SparkLineChartSlotsComponent,
} from 'node_modules/@mui/x-charts/SparkLineChart/SparkLineChart';
import { type MakeOptional } from '@mui/x-date-pickers/internals/models/helpers';

/**
 * Currently not exported by the @mui/x-charts library, therefore we need to redeclare it here.
 * @description The props for the SparkLineChart component.
 */
export interface SparkLineChartProps
  extends Omit<ResponsiveChartContainerProps, 'series' | 'xAxis' | 'yAxis' | 'margin'> {
  /**
   * The xAxis configuration.
   * Notice it is a single configuration object, not an array of configuration.
   */
  xAxis?: MakeOptional<AxisConfig, 'id'>;
  tooltip?: ChartsTooltipProps;
  axisHighlight?: ChartsAxisHighlightProps;
  /**
   * Type of plot used.
   * @default 'line'
   */
  plotType?: 'line' | 'bar';
  /**
   * Data to plot.
   */
  data: number[];
  /**
   * Formatter used by the tooltip.
   * @param {number} value The value to format.
   * @returns {string} the formatted value.
   * @default (v: number) => v.toString()
   */
  valueFormatter?: (value: number) => string;
  /**
   * Set to `true` to enable the tooltip in the sparkline.
   * @default false
   */
  showTooltip?: boolean;
  /**
   * Set to `true` to highlight the value.
   * With line, it shows a point.
   * With bar, it shows a highlight band.
   * @default false
   */
  showHighlight?: boolean;
  /**
   * Set to `true` to fill spark line area.
   * Has no effect if plotType='bar'.
   * @default false
   */
  area?: LineSeriesType['area'];
  /**
   * @default 'linear'
   */
  curve?: LineSeriesType['curve'];
  /**
   * The margin between the SVG and the drawing area.
   * It's used for leaving some space for extra information such as the x- and y-axis or legend.
   * Accepts an object with the optional properties: `top`, `bottom`, `left`, and `right`.
   * @default {
   *   top: 5,
   *   bottom: 5,
   *   left: 5,
   *   right: 5,
   * }
   */
  margin?: Partial<CardinalDirections<number>>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: SparkLineChartSlotsComponent;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: SparkLineChartSlotComponentProps;
}

export type TSparklineWidget = {
  title: string;
  subtitle?: string;
  cardProps?: CardProps;
  sparklineProps: SparkLineChartProps;
};

export const SparklineWidget: React.FC<TSparklineWidget> = ({
  title,
  subtitle,
  cardProps,
  sparklineProps,
}) => {
  const theme = useTheme();
  return (
    <Card {...cardProps} sx={{ p: 0, ...cardProps?.sx }}>
      <Card.Header sx={{ p: 2 }}>
        <Box>
          <Card.Title>{title}</Card.Title>
          {subtitle && subtitle.length > 0 && <Card.Subtitle>{subtitle}</Card.Subtitle>}
        </Box>
      </Card.Header>
      <Card.Body>
        <SparkLineChart
          height={80}
          colors={[theme.palette.primary.main]}
          margin={{ top: 0, right: 0, bottom: 10, left: 0 }}
          curve="catmullRom"
          showHighlight
          showTooltip
          {...sparklineProps}
        />
      </Card.Body>
    </Card>
  );
};
