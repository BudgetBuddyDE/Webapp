import { bisector, extent, max } from 'd3-array';
import { format } from 'date-fns';
import React from 'react';
import { formatBalance } from '@/utils';
import { useTheme } from '@mui/material';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { GridColumns, GridRows } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AreaClosed, Bar, Line } from '@visx/shape';
import { Tooltip, TooltipWithBounds, defaultStyles, withTooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';

export type AreaChartItem = { date: Date; sum: number };

export interface AreaChartProps {
    data: AreaChartItem[];
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
}

export type TooltipData = AreaChartItem;

function getDate(data: AreaChartItem) {
    return data.date;
}

function getSum(data: AreaChartItem) {
    return Math.abs(data.sum);
}

/**
 * Docs:
 * - [AirBnB](https://airbnb.io/visx/areas)
 */
export default withTooltip<AreaChartProps, TooltipData>(
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
    }: AreaChartProps & WithTooltipProvidedProps<TooltipData>) => {
        const theme = useTheme();
        if (width < 10) return null;

        const background = theme.palette.background.default;
        const background2 = theme.palette.background.paper;
        const accentColor = theme.palette.primary.main;
        const accentColorDark = theme.palette.primary.dark;
        const tooltipStyles = {
            ...defaultStyles,
            background,
            border: '1px solid white',
            color: 'white',
        };

        const bisectDate = bisector<AreaChartItem, Date>((d: AreaChartItem) => d.date).left;

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const dateScale = React.useMemo(
            () =>
                scaleTime({
                    range: [margin.left, innerWidth + margin.left],
                    domain: extent(data, getDate) as [Date, Date],
                }),
            [innerWidth, margin.left, data]
        );

        const valueScale = React.useMemo(
            () =>
                scaleLinear({
                    range: [innerHeight + margin.top, margin.top],
                    domain: [0, (max(data, getSum) || 0) + innerHeight / 3],
                    nice: false,
                }),
            [margin.top, innerHeight, data]
        );

        const handleTooltip = React.useCallback(
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
                    tooltipTop: valueScale(getSum(d)),
                });
            },
            [showTooltip, valueScale, dateScale, bisectDate, data]
        );

        return (
            <div>
                <svg width={width} height={height}>
                    <rect x={0} y={0} width={width} height={height} fill="url(#area-background-gradient)" rx={14} />
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
                    <AreaClosed<AreaChartItem>
                        data={data}
                        x={(d) => dateScale(getDate(d)) ?? 0}
                        y={(d) => valueScale(getSum(d)) ?? 0}
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
                            {formatBalance(getSum(tooltipData))}
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
