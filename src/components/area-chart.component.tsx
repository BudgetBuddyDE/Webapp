import React, { useMemo, useCallback } from 'react';
import { AreaClosed, Line, Bar } from '@visx/shape';
// @ts-ignore
import { curveMonotoneX } from '@visx/curve';
// @ts-ignore
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
// @ts-ignore
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
// @ts-ignore
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
// @ts-ignore
import { localPoint } from '@visx/event';
// @ts-ignore
import { LinearGradient } from '@visx/gradient';
// @ts-ignore
import { max, extent, bisector } from 'd3-array';
import { format } from 'date-fns';

export interface IDailyTransaction {
  date: string;
  sum: number;
  created_by?: string;
}

type TooltipData = IDailyTransaction;

export const background = '#3b6978';
export const background2 = '#204051';
export const accentColor = '#edffea';
export const accentColorDark = '#75daad';
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: 'white',
};

const getDate = (d: IDailyTransaction) => new Date(d.date);
const getValue = (d: IDailyTransaction) => Math.abs(d.sum);
const bisectDate = bisector<IDailyTransaction, Date>(
  (d: IDailyTransaction) => new Date(d.date)
).left;

export type IAreaChartProps = {
  data: IDailyTransaction[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

/**
 * Docs:
 * - [AirBnB](https://airbnb.io/visx/areas)
 */
export default withTooltip<IAreaChartProps, TooltipData>(
  ({
    data,
    width,
    height,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: IAreaChartProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left, data]
    );
    const valueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(data, getValue) || 0) + innerHeight / 3],
          nice: false,
        }),
      [margin.top, innerHeight, data]
    );

    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: valueScale(getValue(d)),
        });
      },
      [showTooltip, valueScale, dateScale, data]
    );

    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#area-background-gradient)"
            rx={14}
          />
          <LinearGradient id="area-background-gradient" from={background} to={background2} />
          <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} />
          <GridRows
            left={margin.left}
            scale={valueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed<IDailyTransaction>
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => valueScale(getValue(d)) ?? 0}
            yScale={valueScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveMonotoneX}
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            rx={14}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={accentColorDark}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={accentColorDark}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {getValue(tooltipData).toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </TooltipWithBounds>
            <Tooltip
              top={margin.top - 14}
              left={tooltipLeft - 7}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: 'center',
                transform: 'translateX(-50%)',
              }}
            >
              {format(getDate(tooltipData), 'dd.MM.yy')}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);
