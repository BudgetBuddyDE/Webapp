import { FC } from 'react';
// @ts-ignore
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleOrdinal } from '@visx/scale';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { Tooltip } from '@mui/material';
import type { IExpense } from '../types/transaction.interface';
import { useScreenSize } from '../hooks/useScreenSize.hook';

function getAbsoluteAmount(expense: IExpense) {
  return Math.abs(expense.sum);
}

export const PieChart: FC<{ expenses: IExpense[] }> = ({ expenses }) => {
  const screenSize = useScreenSize();
  const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
  const CATEGORY_NAMES = Object.entries(expenses).map(([key, value]) => value.category.name);
  const COLOR_RANGE = expenses.map((expense, index) => {
    return expenses.length > 1
      ? `rgba(255,255,255,${(0.7 / expenses.length) * (index + 1)})`
      : `rgba(255,255,255, 0.8)`;
  });

  const DONUT_THICKNESS = screenSize === 'small' ? 75 : 100;
  const TOTAL_SPENDINGS = expenses.map(getAbsoluteAmount).reduce((prev, cur) => prev + cur, 0);

  const getCategoryColor = scaleOrdinal({
    domain: CATEGORY_NAMES,
    range: COLOR_RANGE,
  });

  return (
    <ParentSize>
      {({ width, height }) => {
        const inner = {
          width: width - MARGIN.left - MARGIN.right,
          height: width - MARGIN.top - MARGIN.bottom,
        };
        const axis = {
          y: inner.height / 2,
          x: inner.width / 2,
        };
        const radius = Math.min(inner.width, inner.height) / 2;
        return (
          <svg width={width} height={width}>
            <Group top={axis.y + MARGIN.top} left={axis.x + MARGIN.left}>
              <Pie
                data={expenses}
                pieValue={getAbsoluteAmount}
                outerRadius={radius}
                innerRadius={radius - DONUT_THICKNESS}
                cornerRadius={4}
                padAngle={0.01}
              >
                {
                  // @ts-ignore
                  (pie) =>
                    // @ts-ignore
                    pie.arcs.map((arc, i: number) => {
                      const [centroidX, centroidY] = pie.path.centroid(arc);
                      const hasSpaceForLabel =
                        screenSize === 'small'
                          ? arc.endAngle - arc.startAngle >= 0.15
                          : arc.endAngle - arc.startAngle >= 0.2;
                      return (
                        <>
                          <g key={`pie-arc-${i}`}>
                            <Tooltip
                              title={`${arc.data.category.name}: ${Math.abs(
                                arc.data.sum
                              ).toLocaleString('de', {
                                style: 'currency',
                                currency: 'EUR',
                              })}`}
                            >
                              <path
                                d={pie.path(arc) || ''}
                                fill={getCategoryColor(arc.data.category.name)}
                              />
                            </Tooltip>
                            {hasSpaceForLabel && (
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
                                  {arc.data.category.name}
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
                                  {Math.abs(arc.data.sum).toLocaleString('de', {
                                    style: 'currency',
                                    currency: 'EUR',
                                  })}
                                </text>
                                <text
                                  fill="white"
                                  x={centroidX}
                                  y={centroidY + 13}
                                  dy=".33em"
                                  fontSize={screenSize === 'small' ? 10 : 12}
                                  textAnchor="middle"
                                >
                                  {Math.abs((arc.data.sum * 100) / TOTAL_SPENDINGS).toFixed(2)} %
                                </text>
                              </g>
                            )}
                          </g>
                          <g key={`pie-arc-z${i}`}>
                            <text
                              fill="white"
                              textAnchor="middle"
                              fontSize={screenSize === 'small' ? 20 : 28}
                            >
                              {TOTAL_SPENDINGS.toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </text>
                          </g>
                        </>
                      );
                    })
                }
              </Pie>
            </Group>
          </svg>
        );
      }}
    </ParentSize>
  );
};
