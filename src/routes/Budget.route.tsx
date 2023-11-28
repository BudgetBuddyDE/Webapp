import { type PaginationHandler } from '@/components/Base/Pagination';
import { ContentGrid } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { CategorySpendingsChart } from '@/core/Category';
import { CategoryIncomeChart } from '@/core/Category/Chart/IncomeChart.component';
import { TCategory } from '@/types';
import { Grid, Typography } from '@mui/material';

interface BudgetsHandler {
  onSearch: (keyword: string) => void;
  onCategoryDelete: (category: TCategory) => void;
  onConfirmCategoryDelete: () => void;
  onEditCategory: (category: TCategory) => void;
  pagination: PaginationHandler;
}

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';
export type TChartContentType = 'INCOME' | 'SPENDINGS';
export const ChartContentTypes = [
  { type: 'INCOME' as TChartContentType, label: 'Income' },
  { type: 'SPENDINGS' as TChartContentType, label: 'Spendings' },
];

export const Budgets = () => {
  return (
    <ContentGrid title={'Budget'}>
      <Grid item xs={12} md={12} lg={8} xl={4}>
        <Typography></Typography>
      </Grid>

      <Grid container item xs={12} md={12} lg={8} xl={8}>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          das
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategorySpendingsChart withList />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryIncomeChart withList />
        </Grid>
      </Grid>
    </ContentGrid>
  );
};

export default withAuthLayout(Budgets);
