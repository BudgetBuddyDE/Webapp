export type TDashboardView = 'overview' | 'budget' | 'stocks' | 'analytics';

export * from './mappings';
export {default as DashboardLayout} from './DashboardLayout.component';
export {default as DashboardView} from './Dashboard.view';
export {default as BudgetView} from './Budget.view';
export {default as StocksView} from './Stocks.view';
export {default as AnalyticsView} from './Analytics.view';
