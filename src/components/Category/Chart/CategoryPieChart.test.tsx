import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {CategoryPieChart, type TCategoryPieChartProps} from './CategoryPieChart.component';

describe('CategoryPieChart', () => {
  const defaultProps: TCategoryPieChartProps = {
    title: 'Category Chart',
    subtitle: 'Monthly Expenses',
    defaultTimeframe: 'MONTH',
    transactionsType: 'EXPENSE',
    transactions: [],
  };

  it('renders the title and subtitle', () => {
    render(<CategoryPieChart {...defaultProps} />);
    expect(screen.getByText('Category Chart')).toBeInTheDocument();
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
  });

  it('renders the default timeframe toggle buttons', () => {
    render(<CategoryPieChart {...defaultProps} />);
    expect(screen.getByRole('button', {name: 'Month'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'YTD'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'All Time'})).toBeInTheDocument();
  });

  it('renders the "no results" message when there are no transactions', () => {
    render(<CategoryPieChart {...defaultProps} />);
    expect(screen.getByText('There are no transactions for this month!')).toBeInTheDocument();
  });
});