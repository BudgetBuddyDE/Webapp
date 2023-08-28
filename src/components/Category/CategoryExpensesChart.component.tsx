import React from 'react';
import { ParentSize } from '@visx/responsive';
import { PieChart, type PieChartData } from '../Chart/PieChart.component';

export type CategoryExpensesChartProps = {
  data: PieChartData[];
};

export const CategoryExpensesChart: React.FC<CategoryExpensesChartProps> = ({ data }) => {
  return (
    <ParentSize>
      {({ width }) => <PieChart width={width} height={width} data={data} formatAsCurrency showTotalSum />}
    </ParentSize>
  );
};
