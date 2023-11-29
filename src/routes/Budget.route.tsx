import { AddFab, ContentGrid, FabContainer, OpenFilterDrawerFab } from '@/components/Layout';
import { withAuthLayout } from '@/core/Auth/Layout';
import { BudgetList } from '@/core/Budget';
import { CategorySpendingsChart } from '@/core/Category';
import { CategoryIncomeChart } from '@/core/Category/Chart/IncomeChart.component';
import { Grid } from '@mui/material';
import { DailyTransactionChart } from '@/core/Transaction';

export const DATE_RANGE_INPUT_FORMAT = 'dd.MM';
export type TChartContentType = 'INCOME' | 'SPENDINGS';
export const ChartContentTypes = [
  { type: 'INCOME' as TChartContentType, label: 'Income' },
  { type: 'SPENDINGS' as TChartContentType, label: 'Spendings' },
];

export const Budgets = () => {
  return (
    <ContentGrid title={'Budget'}>
      <Grid item xs={12} md={12} lg={5} xl={5}>
        <DailyTransactionChart />
      </Grid>

      <Grid container item xs={12} md={12} lg={7} xl={7} spacing={3}>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <BudgetList />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategorySpendingsChart />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          <CategoryIncomeChart />
        </Grid>
      </Grid>

      <FabContainer>
        <OpenFilterDrawerFab />
      </FabContainer>
    </ContentGrid>
  );
};

export default withAuthLayout(Budgets);
