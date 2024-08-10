import {CircularProgress} from '@/components/Loading';
import {useTransactions} from '@/components/Transaction';

import {CategoryPieChart} from './CategoryPieChart.component';

/**
 * Renders a pie chart displaying the income per category.
 *
 * @returns The CategoryIncomeChart component.
 */
export const CategoryIncomeChart = () => {
  const {isLoading, data: transactions} = useTransactions();
  if (isLoading) return <CircularProgress />;
  return (
    <CategoryPieChart
      title="Category Income"
      subtitle="Income per category"
      transactionsType="INCOME"
      transactions={transactions ?? []}
    />
  );
};
